
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
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession);
        setSession(currentSession);
        
        if (currentSession?.user) {
          // Fetch the user's profile from Supabase
          await fetchUserProfile(currentSession.user.id);
        } else {
          setUser(null);
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      console.log('Initial session check:', currentSession);
      setSession(currentSession);
      
      if (currentSession?.user) {
        // Fetch the user's profile from Supabase
        await fetchUserProfile(currentSession.user.id);
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
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Function to fetch user profile from Supabase
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

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
      // First try Supabase login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log('Supabase login failed, trying mock system:', error.message);
        
        // If Supabase fails, fall back to mock data for development
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
          
          toast({
            title: "Login Successful",
            description: `Welcome back, ${foundUser.name}!`
          });
          
          return true;
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid email or password.",
            variant: "destructive",
          });
          return false;
        }
      }

      // Supabase login successful
      if (data.user) {
        toast({
          title: "Login Successful",
          description: "Welcome back!"
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
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
        console.log('Supabase registration failed, using mock system:', error.message);
        
        // If Supabase fails, fall back to mock data for development
        // Check if user already exists in mock data
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
          toast({
            title: "Registration Failed",
            description: "An account with this email already exists.",
            variant: "destructive",
          });
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
        
        toast({
          title: "Registration Successful",
          description: `Welcome to FarmLytic, ${name}!`,
        });
        return true;
      }

      // Supabase registration successful
      if (data.user) {
        toast({
          title: "Registration Successful",
          description: `Welcome to FarmLytic, ${name}!`,
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    // First try Supabase logout
    if (session) {
      await supabase.auth.signOut();
    }
    
    // Also clear local storage
    setUser(null);
    localStorage.removeItem('farmlytic_user');
    
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
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
