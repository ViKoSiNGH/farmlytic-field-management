
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

interface LoginFormValues {
  email: string;
  password: string;
}

export function LoginForm() {
  const { toast } = useToast();
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<LoginFormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    const success = await login(data.email, data.password);
    setIsSubmitting(false);
    
    if (success) {
      navigate('/');
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-8 glass-card rounded-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Login to FarmLytic</h1>
        <p className="text-muted-foreground">Enter your credentials to access your account</p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    type="email" 
                    required 
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your password" 
                    type="password" 
                    required 
                    disabled={isSubmitting}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>
        </form>
      </Form>
      
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/register" className="underline text-primary hover:text-primary/90">
            Register
          </Link>
        </p>
      </div>
      
      <div className="pt-4 text-center border-t border-border text-sm text-muted-foreground">
        <p>Demo Credentials</p>
        <p>Email: john@example.com</p>
        <p>Password: password123</p>
      </div>
    </div>
  );
}
