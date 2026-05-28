import { MessageCircle } from 'lucide-react';

export default function FloatingWhatsApp() {
  const handleWhatsApp = () => {
    const message = 'Hi! I would like to know more about your products.';
    const whatsappUrl = `https://wa.me/919170259644?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <button
      onClick={handleWhatsApp}
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition-all hover:scale-110 active:scale-95"
      aria-label="WhatsApp Chat"
      title="Chat with us on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </button>
  );
}
