
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import { Edit, Trash, PlusCircle } from 'lucide-react';
import { FileUploader } from '@/components/FileUploader';

// Types for our component
interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

const Admin: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: 'https://placehold.co/600x400?text=Sin+Imagen'
  });
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (user && !isAdmin) {
      navigate('/');
      toast({
        title: 'Acceso denegado',
        description: 'No tienes permisos para acceder a esta página',
        variant: 'destructive',
      });
      return;
    }

    fetchProducts();
  }, [user, isAdmin, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudieron cargar los productos',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `/Colchon.jpg`;

      // Upload the file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('almacenamiento')
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('almacenamiento')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      toast({
        title: 'Error de carga',
        description: error.message || 'No se pudo cargar la imagen',
        variant: 'destructive',
      });
      return 'https://placehold.co/600x400?text=Error+de+Carga';
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProduct = async () => {
    try {
      if (!newProduct.name || !newProduct.description || newProduct.price === undefined || newProduct.stock === undefined) {
        toast({
          title: 'Error',
          description: 'Por favor completa todos los campos',
          variant: 'destructive',
        });
        return;
      }

      // Handle image upload if a file was selected
      let imageUrl = newProduct.image;
      if (uploadedFile) {
        imageUrl = await handleFileUpload(uploadedFile);
      }

      const { data, error } = await supabase
        .from('products')
        .insert({
          ...newProduct,
          image: imageUrl,
        })
        .select();

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Producto añadido correctamente',
      });

      // Reset form and close dialog
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image: 'https://placehold.co/600x400?text=Sin+Imagen'
      });
      setUploadedFile(null);
      setOpenDialog(false);
      
      // Refresh products list
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo añadir el producto',
        variant: 'destructive',
      });
    }
  };

  const handleEditProduct = async () => {
    try {
      if (!selectedProduct) return;
      
      // Handle image upload if a file was selected
      let imageUrl = selectedProduct.image;
      if (uploadedFile) {
        imageUrl = await handleFileUpload(uploadedFile);
      }

      const { error } = await supabase
        .from('products')
        .update({
          name: selectedProduct.name,
          description: selectedProduct.description,
          price: selectedProduct.price,
          stock: selectedProduct.stock,
          image: imageUrl,
        })
        .eq('id', selectedProduct.id.toString());

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Producto actualizado correctamente',
      });

      // Reset and close dialog
      setSelectedProduct(null);
      setUploadedFile(null);
      setOpenDialog(false);
      
      // Refresh products list
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo actualizar el producto',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async () => {
    try {
      if (!selectedProduct) return;

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', selectedProduct.id.toString());

      if (error) throw error;

      toast({
        title: 'Éxito',
        description: 'Producto eliminado correctamente',
      });

      // Reset and close dialog
      setSelectedProduct(null);
      setDeleteDialogOpen(false);
      
      // Refresh products list
      fetchProducts();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'No se pudo eliminar el producto',
        variant: 'destructive',
      });
    }
  };

  const handleFileChange = (file: File) => {
    setUploadedFile(file);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 pt-28">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <motion.h1 
              className="text-3xl font-bold"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Panel de Administración
            </motion.h1>
            <Button 
              onClick={() => {
                setSelectedProduct(null);
                setNewProduct({
                  name: '',
                  description: '',
                  price: 0,
                  stock: 0,
                  image: 'https://placehold.co/600x400?text=Sin+Imagen'
                });
                setOpenDialog(true);
              }}
              className="bg-funneepurple hover:bg-funneepurple/90 flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Añadir Producto
            </Button>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Gestión de Productos</CardTitle>
                <CardDescription>
                  Administra el catálogo de productos de la tienda
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-funneepurple"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-lg text-gray-500 dark:text-gray-400">
                      No hay productos en el catálogo
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Imagen</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Precio</TableHead>
                          <TableHead>Stock</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.map((product) => (
                          <TableRow key={product.id}>
                            <TableCell>
                              <div className="h-16 w-16 rounded overflow-hidden">
                                <img 
                                  src={product.image || 'https://placehold.co/600x400?text=Sin+Imagen'} 
                                  alt={product.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="max-w-xs truncate">{product.description}</TableCell>
                            <TableCell>${product.price.toFixed(2)}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setOpenDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-red-500"
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      {/* Add/Edit Product Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedProduct ? 'Editar Producto' : 'Añadir Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              Complete los detalles del producto y guarde los cambios.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="name" className="col-span-1">
                Nombre
              </Label>
              <Input
                id="name"
                value={selectedProduct ? selectedProduct.name : newProduct.name}
                onChange={(e) => {
                  if (selectedProduct) {
                    setSelectedProduct({
                      ...selectedProduct,
                      name: e.target.value,
                    });
                  } else {
                    setNewProduct({
                      ...newProduct,
                      name: e.target.value,
                    });
                  }
                }}
                className="col-span-4"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="description" className="col-span-1">
                Descripción
              </Label>
              <Textarea
                id="description"
                value={selectedProduct ? selectedProduct.description : newProduct.description}
                onChange={(e) => {
                  if (selectedProduct) {
                    setSelectedProduct({
                      ...selectedProduct,
                      description: e.target.value,
                    });
                  } else {
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    });
                  }
                }}
                className="col-span-4"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="price" className="col-span-1">
                Precio
              </Label>
              <Input
                id="price"
                type="number"
                value={selectedProduct ? selectedProduct.price : newProduct.price}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  if (selectedProduct) {
                    setSelectedProduct({
                      ...selectedProduct,
                      price: isNaN(value) ? 0 : value,
                    });
                  } else {
                    setNewProduct({
                      ...newProduct,
                      price: isNaN(value) ? 0 : value,
                    });
                  }
                }}
                className="col-span-4"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label htmlFor="stock" className="col-span-1">
                Stock
              </Label>
              <Input
                id="stock"
                type="number"
                value={selectedProduct ? selectedProduct.stock : newProduct.stock}
                onChange={(e) => {
                  const value = parseInt(e.target.value);
                  if (selectedProduct) {
                    setSelectedProduct({
                      ...selectedProduct,
                      stock: isNaN(value) ? 0 : value,
                    });
                  } else {
                    setNewProduct({
                      ...newProduct,
                      stock: isNaN(value) ? 0 : value,
                    });
                  }
                }}
                className="col-span-4"
              />
            </div>
            <div className="grid grid-cols-5 items-center gap-4">
              <Label className="col-span-1">Imagen</Label>
              <div className="col-span-4">
                <FileUploader onFileChange={handleFileChange} />
                {isUploading && (
                  <div className="mt-2 text-sm text-gray-500">
                    Subiendo imagen...
                  </div>
                )}
                <div className="mt-2">
                  <img
                    src={uploadedFile ? URL.createObjectURL(uploadedFile) : (selectedProduct ? selectedProduct.image : newProduct.image)}
                    alt="Vista previa"
                    className="h-24 w-auto rounded"
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenDialog(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={selectedProduct ? handleEditProduct : handleAddProduct}
              className="bg-funneepurple hover:bg-funneepurple/90"
              disabled={isUploading}
            >
              {isUploading ? 'Subiendo...' : selectedProduct ? 'Guardar Cambios' : 'Añadir Producto'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Eliminación</DialogTitle>
            <DialogDescription>
              ¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedProduct && (
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded overflow-hidden">
                  <img 
                    src={selectedProduct.image || 'https://placehold.co/600x400?text=Sin+Imagen'} 
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h4 className="font-medium">{selectedProduct.name}</h4>
                  <p className="text-sm text-gray-500">${selectedProduct.price.toFixed(2)}</p>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteProduct}
            >
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Footer />
    </div>
  );
};

export default Admin;
