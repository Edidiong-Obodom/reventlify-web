// Add this below the WinWinDiagram component

export default function FAQSection() {
  const faqs = [
    {
      question: "How does the affiliate profit split work?",
      answer:
        "When you sell a ticket as an affiliate, you earn 50% of Reventlify's profit from that ticket. The remaining profit helps us maintain the platform and support event creators.",
    },
    {
      question: "Do I need to sign up as an affiliate?",
      answer:
        "No! Every user is automatically an affiliate. You can start sharing tickets and earning immediately.",
    },
    {
      question: "How do I get paid?",
      answer:
        "Your earnings are automatically tracked on your dashboard. You can request withdrawals anytime using our secure payment system.",
    },
    {
      question: "Can I sell tickets for any event?",
      answer: "Yes! You can sell tickets for any listed event on Reventlify.",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <h2 className="text-3xl font-bold text-center mb-8">
        Frequently Asked Questions
      </h2>
      <div className="max-w-4xl mx-auto space-y-6">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition"
          >
            <h3 className="font-semibold text-lg mb-2">
              {faq.question}
            </h3>
            <p className="text-gray-600">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
