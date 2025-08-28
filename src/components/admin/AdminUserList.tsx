import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { firestore, auth } from '@/config/firebase';
import { createUserWithEmailAndPassword, getAuth, fetchSignInMethodsForEmail } from 'firebase/auth';
import { useFirestorePaths } from '@/hooks/useFirestorePaths';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Edit, Trash, Plus } from 'lucide-react';
import { Role, UserType } from '@/types/auth';
import { toast } from 'sonner';

interface UserListItem {
  id: string;
  name: string;
  email: string;
  userType?: UserType;
  role?: Role;
  mobileNumber?: string;
  address?: string;
}




const AdminUserList: React.FC = () => {
  const paths = useFirestorePaths('shopping_cart');
  const currentAdminId = localStorage.getItem('currentAdminId') || '';
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserListItem | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    userType: UserType.Customer,
    role: Role.CUSTOMER,
    password: '',
    confirmPassword: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersRef = collection(firestore, paths.getTenantUsersPath());
      const snapshot = await getDocs(usersRef);
      const list: UserListItem[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          name: data.name || '',
          email: data.email || '',
          userType: data.userType,
          role: data.role,
          mobileNumber: data.mobileNumber,
          address: data.address,
        });
      });
      setUsers(list);
    } catch (e) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const openAddDialog = () => {
    setEditUser(null);
    setForm({
      name: '',
      email: '',
      userType: UserType.Customer,
      role: Role.CUSTOMER,
      password: '',
      confirmPassword: '',
    });
    setDialogOpen(true);
  };

  const openEditDialog = (user: UserListItem) => {
    setEditUser(user);
    setForm({
      name: user.name,
      email: user.email,
      userType: user.userType || UserType.Customer,
      role: user.role || Role.CUSTOMER,
      password: '',
      confirmPassword: '',
    });
    setDialogOpen(true);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.userType || !form.role) {
      toast.error('All fields are required');
      return;
    }
    if (!editUser && (!form.password || !form.confirmPassword)) {
      toast.error('Password and confirm password are required');
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setFormLoading(true);
    try {
      if (editUser) {
        // Prevent company admin from editing self
        if (editUser.id === currentAdminId && editUser.role === Role.COMPANY_ADMIN) {
          toast.error('Company admin cannot update himself');
          setFormLoading(false);
          return;
        }
        const userDocRef = doc(firestore, paths.getTenantUserPath(editUser.id));
        await setDoc(userDocRef, {
          name: form.name,
          email: form.email,
          userType: form.userType,
          role: form.role,
        }, { merge: true });
        toast.success('User updated');
      } else {
        // Add user: first check if user exists in Firebase Auth
        const authInstance = getAuth();
        let userUid = null;
        try {
          // Check if user exists in Firebase Auth
          const signInMethods = await fetchSignInMethodsForEmail(authInstance, form.email);
          if (signInMethods.length === 0) {
            // User does not exist, create in Auth
            const userCredential = await createUserWithEmailAndPassword(authInstance, form.email, form.password);
            userUid = userCredential.user.uid;
          } else {
            // User exists in Auth, get their UID by querying Firestore 'users' collection
            // (You may have a central users collection, or you can only add to company list)
            // We'll try to find the user in company list by email
            const usersRef = collection(firestore, paths.getTenantUsersPath());
            const snapshot = await getDocs(usersRef);
            let found = false;
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              if (data.email === form.email) {
                found = true;
                userUid = docSnap.id;
              }
            });
            if (found) {
              toast.error('User already exists in this company list.');
              setFormLoading(false);
              return;
            }
            // If not found in company list, we will add
            // But we need a UID. We'll use email as doc id (not ideal, but fallback)
            userUid = undefined; // Will let Firestore auto-generate if not found
          }
        } catch (err: any) {
          toast.error(err.message || 'Failed to check user in Auth');
          setFormLoading(false);
          return;
        }
        // Add to Firestore company user list
        let userDocRef;
        if (userUid) {
          userDocRef = doc(firestore, paths.getTenantUserPath(userUid));
        } else {
          userDocRef = doc(collection(firestore, paths.getTenantUsersPath()));
        }
        await setDoc(userDocRef, {
          name: form.name,
          email: form.email,
          userType: form.userType,
          role: form.role,
          createdAt: new Date().toISOString(),
        });
        toast.success('User added');
      }
      setDialogOpen(false);
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (user: UserListItem) => {
    // Prevent company admin from deleting self
    if (user.id === currentAdminId && user.role === Role.COMPANY_ADMIN) {
      toast.error('Company admin cannot delete himself');
      return;
    }
    if (!window.confirm('Delete this user?')) return;
    try {
      const userDocRef = doc(firestore, paths.getTenantUserPath(user.id));
      await deleteDoc(userDocRef);
      toast.success('User deleted');
      fetchUsers();
    } catch (e: any) {
      toast.error(e.message || 'Failed to delete user');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex flex-col">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex-grow space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">User List</CardTitle>
            <CardDescription>All users in your company</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full sm:w-64"
              />
              <Button onClick={openAddDialog} className="flex items-center">
                <Plus className="mr-2 h-4 w-4" /> Add User
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>User Type</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center">No users found</TableCell>
                      </TableRow>
                    ) : (
                      filtered.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.userType || '-'}</TableCell>
                          <TableCell>{user.role || '-'}</TableCell>
                          <TableCell>{user.mobileNumber || '-'}</TableCell>
                          <TableCell>{user.address || '-'}</TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" onClick={() => openEditDialog(user)} className="mr-2">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(user)}>
                              <Trash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editUser ? 'Edit User' : 'Add User'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleFormChange}
                required
              />
              <Input
                name="email"
                placeholder="Email"
                type="email"
                value={form.email}
                onChange={handleFormChange}
                required
              />
              <select
                name="userType"
                value={form.userType}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-2"
                required
              >
                {Object.values(UserType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <select
                name="role"
                value={form.role}
                onChange={handleFormChange}
                className="w-full border rounded px-2 py-2"
                required
              >
                {Object.values(Role).map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              {!editUser && (
                <>
                  <Input
                    name="password"
                    placeholder="Password"
                    type="password"
                    value={form.password}
                    onChange={handleFormChange}
                    required
                  />
                  <Input
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleFormChange}
                    required
                  />
                </>
              )}
              <Button type="submit" className="w-full" disabled={formLoading}>
                {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {formLoading ? 'Saving...' : editUser ? 'Update User' : 'Add User'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUserList;
