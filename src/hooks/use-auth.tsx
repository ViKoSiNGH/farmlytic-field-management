
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types/auth';

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

// Mock user data for demonstration
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

// AuthProvider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check for saved auth on initial load
  useEffect(() => {
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
  }, []);

  // Get user role
  const getRole = (): UserRole | null => {
    return user ? user.role : null;
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    setIsLoading(true);
    try {
      // In a real app, this would be an API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user with matching credentials
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
          description: `Welcome back, ${foundUser.name}!`,
        });
        return true;
      } else {
        toast({
          title: "Login Failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
        return false;
      }
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
    // Simulate API call
    setIsLoading(true);
    try {
      // In a real app, this would be an API request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
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
  const logout = () => {
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
