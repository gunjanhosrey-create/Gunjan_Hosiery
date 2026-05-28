import { MapPin, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AddressPage = () => {
  const address =
    'C-34, UPSIDC Industrial Area, Rooma, Chekeri Ward, Kanpur, Uttar Pradesh 209402, India';
  const mapLink = 'https://maps.app.goo.gl/tPU8mB967RQDf4yH6';
  const mapEmbed =
    'https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d1257.6917749063716!2d80.42968070026852!3d26.35948817424371!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1sen!2sin!4v1774349725043!5m2!1sen!2sin';

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-secondary py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Address</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Visit us at our location or get in touch
          </p>
        </div>
      </div>

      {/* Address Details */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Address Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Address
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  C-34, UPSIDC Industrial Area, Rooma, Chekeri Ward<br />
                  Kanpur, Uttar Pradesh 209402<br />
                  India
                </p>
                <a
                  href={mapLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Open in Google Maps
                </a>
              </CardContent>
            </Card>

            {/* Phone Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Phone
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  +91 9170259644
                </p>
              </CardContent>
            </Card>

            {/* Email Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Email
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  gunjanhosrey@gmail.com
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-10 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <iframe
              title="Gunjan Hosiery Location"
              src={mapEmbed}
              className="h-[380px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default AddressPage;
