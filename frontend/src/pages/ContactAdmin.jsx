import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from 'sonner';
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  User,
  Send,
  Loader2,
  Globe,
  Building2,
  CheckCircle
} from 'lucide-react';

const ContactAdmin = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name || !email || !subject || !message) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    // Simulate sending - in production, this would send to your backend/email service
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success('Message sent successfully!');
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-stone-50 py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-12 pb-8">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900 mb-2">Message Sent!</h2>
            <p className="text-stone-500 mb-6">
              Thank you for contacting us. Our admin team will get back to you within 24-48 hours.
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/">
                <Button variant="outline">Go Home</Button>
              </Link>
              <Button onClick={() => setSubmitted(false)} className="bg-emerald-800 hover:bg-emerald-700">
                Send Another Message
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-stone-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Contact Admin</h1>
          <p className="text-stone-500 max-w-md mx-auto">
            Have questions about listing your business or need help with website development? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Contact Info Cards */}
          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Website Development</h3>
                    <p className="text-sm text-stone-500 mt-1">
                      Need a professional website for your business? We can help you build one.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">Business Listing</h3>
                    <p className="text-sm text-stone-500 mt-1">
                      Questions about listing your business or verification process.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-stone-900">General Support</h3>
                    <p className="text-sm text-stone-500 mt-1">
                      Any other questions or feedback about Oyo Biz.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a message</CardTitle>
                <CardDescription>Fill out the form below and we'll get back to you soon.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <Input
                          id="name"
                          type="text"
                          placeholder="Your name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-10 h-11"
                          required
                          data-testid="contact-name"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-10 h-11"
                          required
                          data-testid="contact-email"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+234 xxx xxx xxxx"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-10 h-11"
                          data-testid="contact-phone"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Select value={subject} onValueChange={setSubject}>
                        <SelectTrigger className="h-11" data-testid="contact-subject">
                          <SelectValue placeholder="Select a subject" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="website">Website Development</SelectItem>
                          <SelectItem value="listing">Business Listing Help</SelectItem>
                          <SelectItem value="verification">CAC Verification</SelectItem>
                          <SelectItem value="support">General Support</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Tell us how we can help you..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={5}
                      required
                      data-testid="contact-message"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-800 hover:bg-emerald-700"
                    disabled={loading}
                    data-testid="contact-submit"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactAdmin;
