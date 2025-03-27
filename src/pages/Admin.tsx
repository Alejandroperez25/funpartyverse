import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { Pencil, Trash, Plus } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

const Admin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      image: ''
    }
  });

  // Fetch products from Supabase
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddProduct = async (data: any) => {
    setLoading(true);
    
    // If editing, update the product
    if (editing) {
      const { error } = await supabase
        .from('products')
        .update({
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          image: data.image,
          updated_at: new Date()
        })
        .eq('id', editing);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Éxito',
          description: 'Producto actualizado correctamente',
        });
        setEditing(null);
      }
    } 
    // Otherwise, insert a new product
    else {
      const { error } = await supabase
        .from('products')
        .insert({
          name: data.name,
          description: data.description,
          price: data.price,
          stock: data.stock,
          image: data.image
        });
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Éxito',
          description: 'Producto añadido correctamente',
        });
      }
    }
    
    // Reset form and fetch updated products
    form.reset();
    setShowForm(false);
    fetchProducts();
  };

  const handleEditProduct = (product: Product) => {
    setEditing(product.id);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image
    });
    setShowForm(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Éxito',
          description: 'Producto eliminado correctamente',
        });
        fetchProducts();
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Administración de Productos</h1>
      
      <div className="mb-6">
        {!showForm ? (
          <Button 
            onClick={() => {
              setEditing(null);
              form.reset({
                name: '',
                description: '',
                price: 0,
                stock: 0,
                image: ''
              });
              setShowForm(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Añadir Producto
          </Button>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {editing ? 'Editar Producto' : 'Añadir Nuevo Producto'}
            </h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleAddProduct)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nombre del producto" 
                          {...field} 
                          required
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descripción del producto" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Precio</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="stock"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cantidad en stock</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="1" 
                            min="0"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL de la imagen</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://ejemplo.com/imagen.jpg" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowForm(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Guardar</Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Imagen</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">Cargando productos...</TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">No hay productos disponibles</TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-16 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                        Sin imagen
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>${product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Admin;
