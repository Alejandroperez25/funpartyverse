import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  created_at: string;
}

const Admin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product> | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const navigate = useNavigate();
  const { theme } = useTheme();

  // Form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [image, setImage] = useState('');

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
        navigate('/');
        return;
      }
      
      // Here you would check if the user has admin role
      // For simplicity, we're just checking if they're authenticated
      setIsAdmin(true);
      fetchProducts();
    };
    
    checkAdmin();
  }, [navigate]);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  const handleAddProduct = async () => {
    if (!name || !price || !stock) {
      toast({
        title: 'Error',
        description: 'Por favor, complete todos los campos requeridos.',
        variant: 'destructive',
      });
      return;
    }
    
    const newProduct = {
      name,
      description: description || null,
      price: parseFloat(price),
      stock: parseInt(stock),
      image: image || null,
    };
    
    const { data, error } = await supabase
      .from('products')
      .insert([newProduct])
      .select();
      
    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo añadir el producto.',
        variant: 'destructive',
      });
      console.error('Error adding product:', error);
    } else {
      toast({
        title: 'Producto añadido',
        description: `${name} ha sido añadido correctamente.`,
      });
      setProducts([...products, ...data]);
      setOpen(false);
    }
  };

  const handleUpdateProduct = async () => {
    if (!currentProduct?.id) return;
    
    const updatedProduct = {
      name,
      description: description || null,
      price: parseFloat(price),
      stock: parseInt(stock),
      image: image || null,
    };
    
    const { data, error } = await supabase
      .from('products')
      .update(updatedProduct)
      .eq('id', currentProduct.id)
      .select();
      
    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el producto.',
        variant: 'destructive',
      });
      console.error('Error updating product:', error);
    } else {
      toast({
        title: 'Producto actualizado',
        description: `${name} ha sido actualizado correctamente.`,
      });
      setProducts(products.map(p => (p.id === currentProduct.id ? { ...p, ...updatedProduct } : p)));
      setOpen(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este producto?');
    if (!confirmDelete) return;
    
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el producto.',
        variant: 'destructive',
      });
      console.error('Error deleting product:', error);
    } else {
      toast({
        title: 'Producto eliminado',
        description: 'El producto ha sido eliminado correctamente.',
      });
      setProducts(products.filter(p => p.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-funneepurple"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Acceso Restringido</h1>
            <p className="mb-4">No tienes permiso para acceder a esta página.</p>
            <Button onClick={() => navigate('/')}>
              Volver al Inicio
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Administración de Productos</h1>
            <Button 
              onClick={() => {
                setCurrentProduct(null);
                setName('');
                setDescription('');
                setPrice('');
                setStock('');
                setImage('');
                setIsNewProduct(true);
                setOpen(true);
              }}
              className="bg-funneepurple hover:bg-funneepurple/90"
            >
              Añadir Producto
            </Button>
          </div>
          
          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xl text-gray-600 dark:text-gray-300">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="h-12 w-12 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                          <img 
                            src={product.image || 'https://placehold.co/100x100?text=No+Image'} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>${product.price.toFixed(2)}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => {
                              setCurrentProduct(product);
                              setName(product.name);
                              setDescription(product.description || '');
                              setPrice(product.price.toString());
                              setStock(product.stock.toString());
                              setImage(product.image || '');
                              setIsNewProduct(false);
                              setOpen(true);
                            }}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[525px]">
              <DialogHeader>
                <DialogTitle>{isNewProduct ? 'Añadir Producto' : 'Editar Producto'}</DialogTitle>
                <DialogDescription>
                  Complete los detalles del producto a continuación.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nombre
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Descripción
                  </Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="price" className="text-right">
                    Precio
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="stock" className="text-right">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="image" className="text-right">
                    Imagen URL
                  </Label>
                  <Input
                    id="image"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  onClick={isNewProduct ? handleAddProduct : handleUpdateProduct}
                  className="bg-funneepurple hover:bg-funneepurple/90"
                >
                  {isNewProduct ? 'Añadir' : 'Actualizar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
