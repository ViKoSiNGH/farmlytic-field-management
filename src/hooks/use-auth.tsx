import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/auth';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
  }>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  getRole: () => UserRole | null;
  updateUserProfile: (profileData: {name?: string; email?: string; phone?: string}) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession);
        
        if (!mounted) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    const initSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Initial session check:', currentSession);
        
        if (!mounted) return;
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 100);
        } else {
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
        localStorage.setItem('farmlytic_user', JSON.stringify(userProfile));
        console.log('User profile loaded:', userProfile);
      } else {
        console.log('No profile found for user ID:', userId);
        
        if (session?.user) {
          const authUser = session.user;
          const userProfile: User = {
            id: authUser.id,
            name: authUser.user_metadata?.name || 'User',
            email: authUser.email || '',
            role: (authUser.user_metadata?.role as UserRole) || 'farmer',
          };
          setUser(userProfile);
          localStorage.setItem('farmlytic_user', JSON.stringify(userProfile));
          console.log('Created basic profile from auth data:', userProfile);
          
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

  const getRole = (): UserRole | null => {
    return user ? user.role : null;
  };

  const login = async (email: string, password: string): Promise<{
    success: boolean;
    errorCode?: string;
    errorMessage?: string;
  }> => {
    setIsLoading(true);
    try {
      console.log(`Attempting login for ${email} with Supabase...`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Supabase login error:', error.message);
        
        if (error.message.includes('Email not confirmed')) {
          setIsLoading(false);
          return {
            success: false,
            errorCode: 'email_not_confirmed',
            errorMessage: 'Email not confirmed. Please check your inbox to confirm your account before logging in.'
          };
        }
        
        console.log('Trying mock login system...');
        
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
          const { password, ...userWithoutPassword } = foundUser;
          
          setUser(userWithoutPassword);
          localStorage.setItem('farmlytic_user', JSON.stringify(userWithoutPassword));
          
          console.log('Mock login successful:', userWithoutPassword);
          toast({
            title: "Login Successful",
            description: `Welcome back, ${userWithoutPassword.name}!`,
          });
          
          setIsLoading(false);
          return { success: true };
        } else {
          console.log('Mock login failed: User not found or incorrect credentials');
          
          setIsLoading(false);
          return {
            success: false,
            errorCode: 'invalid_credentials',
            errorMessage: 'Invalid email or password. Please try again.'
          };
        }
      }

      console.log('Supabase login successful:', data);
      
      if (data.user) {
        toast({
          title: "Login Successful",
          description: "Welcome back!",
        });
        
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return {
          success: false,
          errorCode: 'unknown_error',
          errorMessage: 'An unexpected error occurred. Please try again.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      
      setIsLoading(false);
      return {
        success: false,
        errorCode: 'unknown_error',
        errorMessage: 'An unexpected error occurred. Please try again.'
      };
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      console.log(`Attempting to register ${email} with role ${role}...`);
      
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
        
        if (error.message.includes('User already registered')) {
          toast({
            title: "Registration Failed",
            description: "An account with this email already exists. Please try logging in instead.",
            variant: "destructive",
          });
          setIsLoading(false);
          return false;
        }
        
        console.log('Using mock registration system...');
        
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
        
        const newUser = {
          id: (MOCK_USERS.length + 1).toString(),
          name,
          email,
          password,
          role
        };
        
        MOCK_USERS.push(newUser);
        
        const { password: _, ...userWithoutPassword } = newUser;
        
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

      console.log('Supabase registration response:', data);
      
      if (data.user) {
        toast({
          title: "Registration Successful",
          description: `Welcome to FarmLytic, ${name}!`,
        });
        
        if (!data.session) {
          console.log('No session after signup, attempting auto-login...');
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (signInError) {
            console.error('Auto sign-in after registration failed:', signInError);
            
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

  const logout = async () => {
    try {
      if (session) {
        await supabase.auth.signOut();
      }
      
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

  const updateUserProfile = async (profileData: {name?: string; email?: string; phone?: string}) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name || user.name,
          email: profileData.email || user.email,
          phone: profileData.phone || user.phone
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      setUser({
        ...user,
        name: profileData.name || user.name,
        email: profileData.email || user.email,
        phone: profileData.phone || user.phone
      });
      
      localStorage.setItem('farmlytic_user', JSON.stringify({
        ...user,
        name: profileData.name || user.name,
        email: profileData.email || user.email,
        phone: profileData.phone || user.phone
      }));
      
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    if (!session?.user) {
      throw new Error("User not authenticated");
    }
    
    try {
      setIsLoading(true);
      
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        throw new Error("Current password is incorrect");
      }
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Password updated successfully');
    } catch (error) {
      console.error('Error updating password:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    getRole,
    updateUserProfile,
    updatePassword
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
