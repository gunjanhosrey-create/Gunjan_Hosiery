import { MessageCircle, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const WhatsAppOrderPage = () => {
  const handleWhatsAppOrder = () => {
    const message = 'Hi! I would like to place an order. Please help me with the available products and pricing.';
    const whatsappUrl = `https://wa.me/919170259644?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const contactInfo = [
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 9170259644',
    },
    {
      icon: Mail,
      title: 'Email Us',
      content: 'gunjanhosrey@gmail.com',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Order via WhatsApp</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Place your order through WhatsApp and receive prompt, personalized assistance from our team.
          </p>
        </div>
      </div>

      {/* WhatsApp Order Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 text-white rounded-full mb-6">
              <MessageCircle className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Start Your Order</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Click the button below to open WhatsApp and begin a conversation with our team about your order.
            </p>
            <Button
              onClick={handleWhatsAppOrder}
              size="lg"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Order via WhatsApp
            </Button>
          </div>

          {/* Contact Alternatives */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16">
            {contactInfo.map((info) => (
              <Card key={info.title}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <info.icon className="h-5 w-5" />
                    {info.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{info.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">1</div>
                <h4 className="font-semibold mb-2">Choose Products</h4>
                <p className="text-muted-foreground">Tell us which products you are interested in.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">2</div>
                <h4 className="font-semibold mb-2">Get Details</h4>
                <p className="text-muted-foreground">Receive pricing, availability, and customization details.</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">3</div>
                <h4 className="font-semibold mb-2">Complete Order</h4>
                <p className="text-muted-foreground">Confirm your order and finalize payment and delivery arrangements.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhatsAppOrderPage;
