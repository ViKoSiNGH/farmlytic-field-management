
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface UserSettingsFormData {
  name: string;
  email: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function UserSettingsModal({ isOpen, onClose }: UserSettingsModalProps) {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<UserSettingsFormData>({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    }
  });
  
  const onSubmit = async (data: UserSettingsFormData) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Update basic profile information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone || null
        })
        .eq('id', user.id);
        
      if (profileError) {
        throw new Error(profileError.message);
      }
      
      // Handle password change if requested
      if (showPasswordChange && data.currentPassword && data.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: data.newPassword
        });
        
        if (passwordError) {
          throw new Error(passwordError.message);
        }
      }
      
      toast({
        title: "Settings Updated",
        description: "Your account settings have been updated successfully."
      });
      
      onClose();
      
      // Reset the form
      reset({
        name: data.name,
        email: user.email,
        phone: data.phone,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setShowPasswordChange(false);
    } catch (error) {
      console.error('Error updating user settings:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update settings.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Account Settings</DialogTitle>
          <DialogDescription>
            Update your account information and preferences.
          </DialogDescription>
        </DialogHeader>
        
        <ScrollArea className="max-h-[70vh]">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4 px-1">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                {...register('name', { required: "Name is required" })}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                {...register('email')}
                disabled 
                className="bg-muted cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground">Email can't be changed. Contact support for assistance.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input 
                id="phone" 
                {...register('phone')}
                placeholder="e.g., +91 12345 67890"
              />
            </div>
            
            <div className="pt-4 border-t">
              {!showPasswordChange ? (
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPasswordChange(true)}
                >
                  Change Password
                </Button>
              ) : (
                <div className="space-y-4">
                  <h4 className="font-medium">Change Password</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      {...register('currentPassword', { 
                        required: showPasswordChange ? "Current password is required" : false 
                      })}
                      className={errors.currentPassword ? "border-red-500" : ""}
                    />
                    {errors.currentPassword && 
                      <p className="text-red-500 text-sm">{errors.currentPassword.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      {...register('newPassword', { 
                        required: showPasswordChange ? "New password is required" : false,
                        minLength: { value: 6, message: "Password must be at least 6 characters" }
                      })}
                      className={errors.newPassword ? "border-red-500" : ""}
                    />
                    {errors.newPassword && 
                      <p className="text-red-500 text-sm">{errors.newPassword.message}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      {...register('confirmPassword', { 
                        required: showPasswordChange ? "Please confirm your password" : false,
                        validate: value => 
                          !showPasswordChange || !watch('newPassword') || 
                          value === watch('newPassword') || "Passwords do not match"
                      })}
                      className={errors.confirmPassword ? "border-red-500" : ""}
                    />
                    {errors.confirmPassword && 
                      <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowPasswordChange(false)}
                  >
                    Cancel Password Change
                  </Button>
                </div>
              )}
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                variant="destructive" 
                type="button" 
                onClick={() => {
                  logout();
                  onClose();
                }}
              >
                Logout
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
