const num = import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined;

export default function WhatsAppButton() {
  if (!num) return null;
  const href = `https://wa.me/${num}?text=${encodeURIComponent('Hi, SmartCart AI help venum')}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
       className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-green-600">
      💬 WhatsApp
    </a>
  );
}