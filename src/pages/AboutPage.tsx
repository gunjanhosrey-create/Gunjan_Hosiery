import { Sparkles, Award, Users, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function AboutPage() {
  const values = [
    {
      icon: Sparkles,
      title: 'Premium Quality',
      description: 'We source only the finest fabrics and materials for our collections',
    },
    {
      icon: Award,
      title: 'Expert Craftsmanship',
      description: 'Every piece is crafted with attention to detail and precision',
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Your satisfaction and style are our top priorities',
    },
    {
      icon: Heart,
      title: 'Sustainable Fashion',
      description: 'Committed to ethical and sustainable fashion practices',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Gunjan Hosiery</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Redefining luxury fashion with timeless elegance and contemporary style
          </p>
        </div>
      </div>

      {/* Story */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Story</h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              Founded with a passion for exceptional fashion, Gunjan Hosiery has become a
              destination for those who appreciate quality, style, and sophistication. Our
              journey began with a simple vision: to create clothing that makes people feel
              confident and beautiful.
            </p>
            <p>
              Today, we offer a curated collection of premium fashion for men and
              children. From elegant Zara-style pieces to comfortable pogo sets, from luxury
              jacquard outfits to trendy streetwear, every item in our collection is
              carefully selected to meet the highest standards of quality and design.
            </p>
            <p>
              We believe that fashion is more than just clothing—it's a form of
              self-expression, a way to tell your story. That's why we're committed to
              providing not just products, but experiences that inspire and delight.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <Card key={value.title} className="text-center">
                <CardContent className="pt-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full mb-4">
                    <value.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_28px_80px_-40px_rgba(15,23,42,0.35)]">
          <div className="grid items-center gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="h-full">
              <img
                src="/images/gunjan.png"
                alt="Gunjan Hosiery"
                className="h-full min-h-[320px] w-full object-cover"
              />
            </div>
            <div className="p-8 sm:p-10 lg:p-14">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-red-600">
                Our Signature
              </p>
              <h2 className="mb-5 text-3xl font-bold text-slate-900 md:text-4xl">
                Fashion that feels personal, polished, and proudly made for everyday confidence.
              </h2>
              <p className="text-lg leading-8 text-slate-600">
                At Gunjan Hosiery, we believe great style should leave an impression before a
                word is spoken. Every collection is chosen to bring together comfort, quality,
                and a look that makes customers feel confident the moment they wear it.
              </p>
              <p className="mt-4 text-lg leading-8 text-slate-600">
                This is not just about clothing. It is about trust, presentation, and creating
                a shopping experience that feels warm, memorable, and worth coming back to.
              </p>
              <p className="mt-8 text-base font-semibold uppercase tracking-[0.24em] text-slate-900">
                By Gunjan Hosiery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Visit Us */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Visit Our Store</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Come experience our collection in person at our showroom.
          </p>
          <a
            href="https://maps.app.goo.gl/PcNNCtppvxUVdmdw8"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Address by Map
          </a>
        </div>
      </section>

      {/* Live Map */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Find Us</h2>
          <div className="aspect-video w-full rounded-lg overflow-hidden shadow-lg">
                        <iframe
   src="https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d690.0903945989136!2d80.42907341904298!3d26.3598059980356!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e1!3m2!1sen!2sin!4v1774350503673!5m2!1sen!2sin" 
   height="100%"
  width="100%"
  style={{ border: 0 }}
  allowFullScreen
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Gunjan Hosiery Location"
></iframe>
          </div>
          <div className="text-center mt-6">
            <p className="text-muted-foreground mb-4">
              C-34, UPSIDC Industrial Area, Rooma, Chekeri Ward, Kanpur, Uttar Pradesh 209402, India
            </p>
            <a
              href="https://maps.app.goo.gl/PcNNCtppvxUVdmdw8"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Directions
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
