
import React, { useState, useRef } from 'react';
import { X, Send, MessageSquare } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const form = useRef<HTMLFormElement>(null);
  const [message, setMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle'; message: string }>({ type: 'idle', message: '' });

  const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
  const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.REACT_APP_EMAILJS_PUBLIC_KEY;

  const sendEmail = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      setStatus({ type: 'error', message: 'Por favor, escreva sua mensagem.' });
      return;
    }

    if (!serviceId || !templateId || !publicKey) {
        setStatus({ type: 'error', message: 'Erro de configuração. O envio não está disponível.' });
        console.error("EmailJS environment variables are not set.");
        return;
    }

    setIsSending(true);
    setStatus({ type: 'idle', message: '' });

    emailjs.sendForm(serviceId, templateId, form.current!, publicKey)
      .then((result) => {
          setStatus({ type: 'success', message: 'Obrigado pelo seu feedback!' });
          setMessage('');
          setTimeout(() => onClose(), 2000);
      }, (error) => {
          setStatus({ type: 'error', message: 'Ocorreu um erro ao enviar. Tente novamente.' });
          console.error('FAILED...', error.text);
      }).finally(() => {
        setIsSending(false);
      });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 h-screen w-screen bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg relative">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
            <MessageSquare className="mr-3 text-indigo-500" />
            Enviar Feedback ou Sugestão
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X size={24} />
          </button>
        </div>
        <form ref={form} onSubmit={sendEmail} className="p-6 space-y-4">
          <select name="feedback_type" value={feedbackType} onChange={e => setFeedbackType(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white">
            <option value="suggestion">Sugestão</option>
            <option value="bug_report">Relatar um Problema</option>
            <option value="other">Outro</option>
          </select>
          <textarea
            name="message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={5}
            placeholder="Deixe aqui sua sugestão, relato de problema ou qualquer outra mensagem..."
            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white"
          />
          {status.message && (
            <p className={`text-sm ${status.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>{status.message}</p>
          )}
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSending} className="py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
              Cancelar
            </button>
            <button type="submit" disabled={isSending} className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50">
              <Send size={16} />
              {isSending ? 'Enviando...' : 'Enviar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;