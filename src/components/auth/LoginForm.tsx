
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, AlertCircle } from 'lucide-react';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { toast } = useToast();
  const { login, getRole, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isEmailNotConfirmed, setIsEmailNotConfirmed] = useState(false);
  
  // Debug log for authentication state
  useEffect(() => {
    console.log("LoginForm - Auth state:", { isAuthenticated, user });
    
    if (isAuthenticated && user) {
      console.log("LoginForm - User is authenticated, redirecting to", `/${user.role}`);
      navigate(`/${user.role}`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      setAuthError(null);
      setIsEmailNotConfirmed(false);
      
      const { email, password } = data;
      console.log("Attempting login with:", email);
      
      // Try direct Supabase login first
      try {
        const { data: supabaseData, error: supabaseError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (supabaseError) {
          throw supabaseError;
        }
        
        if (supabaseData.user) {
          toast({
            title: "Login Successful",
            description: "Welcome back!",
          });
          
          return; // Auth state change will trigger redirect
        }
      } catch (supabaseError: any) {
        console.error('Direct Supabase login error:', supabaseError);
        
        if (supabaseError.message?.includes('Email not confirmed')) {
          setIsEmailNotConfirmed(true);
          setAuthError("Your email address has not been confirmed. Please check your inbox for a verification email.");
          setIsSubmitting(false);
          return;
        }
      }
      
      // Fallback to our custom login method if direct method fails
      const { success, errorCode, errorMessage } = await login(email, password);
      
      if (success) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        // Force a page reload after a successful login to ensure clean state
        setTimeout(() => {
          const role = getRole() || 'farmer';
          console.log("Redirecting to dashboard for role:", role);
          navigate(`/${role}`, { replace: true });
        }, 500);
      } else {
        // Check if the error is related to email confirmation
        if (errorCode === 'email_not_confirmed') {
          setIsEmailNotConfirmed(true);
          setAuthError("Your email address has not been confirmed. Please check your inbox for a verification email.");
        } else {
          setAuthError(errorMessage || "Invalid email or password. Please try again.");
          toast({
            title: "Login Failed",
            description: errorMessage || "Invalid email or password. Please try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthError("An unexpected error occurred. Please try again.");
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendVerificationEmail = async () => {
    try {
      const email = form.getValues('email');
      if (!email) {
        toast({
          title: "Email Required",
          description: "Please enter your email address.",
          variant: "destructive",
        });
        return;
      }
      
      setIsSubmitting(true);
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });
      
      if (error) {
        toast({
          title: "Failed to Resend",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Verification Email Sent",
          description: "Please check your inbox for the verification email.",
        });
      }
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md space-y-6 p-4 sm:px-6 glass-card rounded-lg">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Login to FarmLytic</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Enter your credentials to access your account</p>
      </div>
      
      {authError && (
        <Alert variant={isEmailNotConfirmed ? "default" : "destructive"} className="text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>
            {authError}
            {isEmailNotConfirmed && (
              <div className="mt-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={resendVerificationEmail} disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Resend verification email'}
                </Button>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}
      
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
                    autoComplete="email"
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
                    autoComplete="current-password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full py-5 sm:py-4" 
            disabled={isSubmitting}
          >
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
    </div>
  );
}
