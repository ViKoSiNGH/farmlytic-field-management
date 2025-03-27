
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  getRole: () => UserRole | null;
}

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state
  useEffect(() => {
    let mounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession);
        
        if (!mounted) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Use setTimeout to prevent potential Supabase deadlock
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Then check for existing session
    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Initial session check:', currentSession);
        
        if (!mounted) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch the user's profile from Supabase with a small delay
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 100);
        } else {
          // Check if we have a locally saved user for development
          const savedUser = localStorage.getItem('farmlytic_user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
            } catch (error) {
              console.error('Failed to parse saved user:', error);
              localStorage.removeItem('farmlytic_user');
            }
          }
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setIsLoading(false);
      }
    };

    initSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        const userProfile: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          role: data.role as UserRole,
          phone: data.phone || undefined
        };
        setUser(userProfile);
        // Also save to localStorage as fallback for development
        localStorage.setItem('farmlytic_user', JSON.stringify(userProfile));
        console.log('User profile loaded:', userProfile);
      } else {
        console.log('No profile found for user ID:', userId);
        
        // If no profile exists yet, try to get basic info from auth
        if (session?.user) {
          const authUser = session.user;
          const userProfile: User = {
            id: authUser.id,
            name: authUser.user_metadata?.name || 'User',
            email: authUser.email || '',
            role: (authUser.user_metadata?.role as UserRole) || 'farmer',
          };
          setUser(userProfile);
          // Also save to localStorage as fallback for development
          localStorage.setItem('farmlytic_user', JSON.stringify(userProfile));
          console.log('Created basic profile from auth data:', userProfile);
          
          // Try to create the profile in the database
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: authUser.id,
                name: authUser.user_metadata?.name || 'User',
                email: authUser.email || '',
                role: authUser.user_metadata?.role || 'farmer'
              });
              
            if (insertError) {
              console.error('Error creating user profile:', insertError);
            } else {
              console.log('Created profile in database');
            }
          } catch (insertError) {
            console.error('Failed to create profile:', insertError);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get user role
  const getRole = (): UserRole | null => {
    return user ? user.role : null;
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`Attempting login for ${email} with Supabase...`);
      
      // First try Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error.message);
        
        // Check if error is related to email confirmation
        if (error.message.includes('Email not confirmed')) {
          toast({
            title: "Email Not Confirmed",
            description: "Please check your email inbox to confirm your account before logging in.",
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
        
        // Try mock login system for development
        console.log('Trying mock login system...');
        
        // Find user with matching credentials in mock data
        const MOCK_USERS = [
          {
            id: '1',
            name: 'John Farmer',
            email: 'farmer@example.com',
            password: 'password123',
            role: 'farmer' as UserRole
          },
          {
            id: '2',
            name: 'Sarah Supplier',
            email: 'supplier@example.com',
            password: 'password123',
            role: 'supplier' as UserRole
          },
          {
            id: '3',
            name: 'Alex Specialist',
            email: 'specialist@example.com',
            password: 'password123',
            role: 'specialist' as UserRole
          }
        ];
        
        const foundUser = MOCK_USERS.find(
          u => u.email === email && u.password === password
        );
        
        if (foundUser) {
          // Omit password from user data
          const { password, ...userWithoutPassword } = foundUser;
          
          // Save user to state and localStorage
          setUser(userWithoutPassword);
          localStorage.setItem('farmlytic_user', JSON.stringify(userWithoutPassword));
          
          console.log('Mock login successful:', userWithoutPassword);
          toast({
            title: "Login Successful",
            description: `Welcome back, ${userWithoutPassword.name}!`,
          });
          
          setIsLoading(false);
          return true;
        } else {
          console.log('Mock login failed: User not found or incorrect credentials');
          toast({
            title: "Login Failed",
            description: "Invalid email or password. Please try again.",
            variant: "destructive",
          });
          
          setIsLoading(false);
          return false;
        }
      }

      // Supabase login successful
      console.log('Supabase login successful:', data);
      
      if (data.user) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        // We don't need to manually set the user here as it will be handled by onAuthStateChange
        
        setIsLoading(false);
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
        
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`Attempting to register ${email} with role ${role}...`);
      
      // Register with Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          },
        }
      });

      if (error) {
        console.error('Supabase registration error:', error.message);
        
        // Handle specific Supabase errors
        if (error.message.includes('User already registered')) {
          toast({
            title: "Registration Failed",
            description: "An account with this email already exists. Please try logging in instead.",
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
        
        // Try mock registration if Supabase fails
        console.log('Using mock registration system...');
        
        // Mock users for development
        const MOCK_USERS = [
          {
            id: '1',
            name: 'John Farmer',
            email: 'farmer@example.com',
            password: 'password123',
            role: 'farmer' as UserRole
          },
          {
            id: '2',
            name: 'Sarah Supplier',
            email: 'supplier@example.com',
            password: 'password123',
            role: 'supplier' as UserRole
          },
          {
            id: '3',
            name: 'Alex Specialist',
            email: 'specialist@example.com',
            password: 'password123',
            role: 'specialist' as UserRole
          }
        ];
        
        const existingUser = MOCK_USERS.find(u => u.email === email);
        
        if (existingUser) {
          console.log('Mock registration failed: User already exists');
          toast({
            title: "Registration Failed",
            description: "An account with this email already exists. Please try logging in instead.",
            variant: "destructive",
          });
          
          setIsLoading(false);
          return false;
        }
        
        // Create new user
        const newUser = {
          id: (MOCK_USERS.length + 1).toString(),
          name,
          email,
          password,
          role
        };
        
        // In a real app, you would save this to a database
        MOCK_USERS.push(newUser);
        
        // Omit password from user data
        const { password: _, ...userWithoutPassword } = newUser;
        
        // Save user to state and localStorage
        setUser(userWithoutPassword);
        localStorage.setItem('farmlytic_user', JSON.stringify(userWithoutPassword));
        
        console.log('Mock registration successful:', userWithoutPassword);
        toast({
          title: "Registration Successful",
          description: `Welcome to FarmLytic, ${name}!`,
        });
        
        setIsLoading(false);
        return true;
      }

      // Supabase registration successful
      console.log('Supabase registration response:', data);
      
      if (data.user) {
        toast({
          title: "Registration Successful",
          description: `Welcome to FarmLytic, ${name}!`,
        });
        
        // If Supabase registration is successful but there's no automatic sign-in,
        // we automatically sign in the user
        if (!data.session) {
          console.log('No session after signup, attempting auto-login...');
          
          // Add a delay to ensure the user is fully created in Supabase
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.error('Auto sign-in after registration failed:', signInError);
            
            // Create a temporary user anyway for development
            const tempUser: User = {
              id: data.user.id,
              name: name,
              email: email,
              role: role
            };
            
            setUser(tempUser);
            localStorage.setItem('farmlytic_user', JSON.stringify(tempUser));
            
            toast({
              title: "Almost Done",
              description: "Registration successful! Please check your email to confirm your account, then log in.",
            });
          } else {
            console.log('Auto sign-in after registration succeeded');
          }
        }
        
        setIsLoading(false);
        return true;
      }

      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      
      setIsLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      // First try Supabase logout
      if (session) {
        await supabase.auth.signOut();
      }
      
      // Also clear local storage
      setUser(null);
      localStorage.removeItem('farmlytic_user');
      
      console.log('User logged out successfully');
      
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Logout Error",
        description: "An error occurred during logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    getRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
