import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Eye, Pencil, Trash } from 'lucide-react';
import Loading from '@/components/Loading';
import FileUploader from '@/components/FileUploader';

interface Product {
  id: string | number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
}

const Admin: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'id'>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    image: 'https://placehold.co/600x400?text=Sin+Imagen'
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { user } = useAuth();
  
  useEffect(() => {
    fetchProducts();
  }, []);
  
  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');
      
    if (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        variant: 'destructive',
      });
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  };
  
  const handleOpenProductDialog = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setNewProduct({
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image
      });
    } else {
      setSelectedProduct(null);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        image: 'https://placehold.co/600x400?text=Sin+Imagen'
      });
    }
    setIsProductDialogOpen(true);
  };
  
  const handleFileChange = (file: File) => {
    setImageFile(file);
  };
  
  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast({
        title: 'Error',
        description: 'El nombre y el precio son obligatorios',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      let imageUrl = newProduct.image;
      
      // Handle image upload if a new file was selected
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);
          
        if (uploadError) {
          throw new Error('Error al subir la imagen');
        }
        
        const { data: urlData } = await supabase.storage
          .from('products')
          .getPublicUrl(fileName);
          
        imageUrl = urlData?.publicUrl || imageUrl;
      }
      
      if (selectedProduct) {
        // Update existing product
        const { error } = await supabase
          .from('products')
          .update({
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            stock: newProduct.stock,
            image: imageUrl
          })
          .eq('id', selectedProduct.id);
          
        if (error) throw error;
        
        toast({
          title: 'Éxito',
          description: 'Producto actualizado correctamente',
        });
      } else {
        // Create new product
        const { error } = await supabase
          .from('products')
          .insert({
            name: newProduct.name,
            description: newProduct.description,
            price: newProduct.price,
            stock: newProduct.stock,
            image: imageUrl,
            user_id: user?.id
          });
          
        if (error) throw error;
        
        toast({
          title: 'Éxito',
          description: 'Producto creado correctamente',
        });
      }
      
      // Refresh product list and close dialog
      fetchProducts();
      setIsProductDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error al guardar el producto',
        variant: 'destructive',
      });
      console.error('Error saving product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenDeleteDialog = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };
  
  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;
    
    setIsSubmitting(true);
    
    try {
      // Convert the ID to string to ensure it works with both string and number types
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', String(selectedProduct.id));
        
      if (error) throw error;
      
      toast({
        title: 'Éxito',
        description: 'Producto eliminado correctamente',
      });
      
      // Refresh product list and close dialog
      fetchProducts();
      setIsDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Ha ocurrido un error al eliminar el producto',
        variant: 'destructive',
      });
      console.error('Error deleting product:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const AdminView = () => {
    return (
      <div className="container mx-auto py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Administrar Productos</h1>
          <Button onClick={() => handleOpenProductDialog()}>Agregar Producto</Button>
        </div>
        
        {loading ? (
          <Loading />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
                  <p className="text-gray-600 line-clamp-3">{product.description}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <div>
                      <span className="text-gray-700 font-bold">${product.price.toFixed(2)}</span>
                      <span className="text-gray-500 ml-2">Stock: {product.stock}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleOpenProductDialog(product)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleOpenDeleteDialog(product)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {user ? (
          <AdminView />
        ) : (
          <div className="container mx-auto py-12 text-center">
            <h1 className="text-3xl font-bold mb-4">Acceso Denegado</h1>
            <p className="text-gray-600">Debes iniciar sesión para acceder a esta página.</p>
          </div>
        )}
        
        {/* Product Dialog */}
        <Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedProduct ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
              <DialogDescription>
                {selectedProduct ? 'Modifica los campos del producto.' : 'Ingresa los datos del nuevo producto.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Nombre</Label>
                <Input 
                  id="name" 
                  value={newProduct.name} 
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descripción</Label>
                <Textarea 
                  id="description" 
                  value={newProduct.description} 
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="price" className="text-right">Precio</Label>
                <Input 
                  type="number"
                  id="price" 
                  value={newProduct.price} 
                  onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="stock" className="text-right">Stock</Label>
                <Input 
                  type="number"
                  id="stock" 
                  value={newProduct.stock} 
                  onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="image" className="text-right">Imagen</Label>
                <div className="col-span-3">
                  <FileUploader onFileChange={handleFileChange} />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsProductDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProduct} disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Eliminar Producto</DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteProduct} disabled={isSubmitting}>
                {isSubmitting ? 'Eliminando...' : 'Eliminar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
      
      <Footer />
    </div>
  );
};

export default Admin;
