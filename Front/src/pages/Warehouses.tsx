import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Warehouse as WarehouseIcon, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import api from '@/lib/axios';

interface WarehouseDto {
    id: number;
    name: string;
    address: string;
    isActive: boolean;
}

const warehouseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    address: z.string().optional(),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

const Warehouses = () => {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: warehouses = [], isLoading } = useQuery({
        queryKey: ['warehouses'],
        queryFn: async () => {
            const res = await api.get<WarehouseDto[]>('/warehouses');
            return res.data;
        }
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<WarehouseFormData>({
        resolver: zodResolver(warehouseSchema)
    });

    const mutation = useMutation({
        mutationFn: async (data: WarehouseFormData) => {
            await api.post('/warehouses', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['warehouses'] });
            setIsModalOpen(false);
            reset();
        }
    });

    return (
        <div className="flex flex-col h-full font-sans">
            <div className="flex justify-between items-center mb-4 bg-gray-50 p-2 border border-gray-200 rounded-sm">
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-bold text-gray-700 px-2 border-r border-gray-300">Warehouses</h1>
                    <Button onClick={() => setIsModalOpen(true)} size="sm" className="bg-yellow-400 text-black border border-yellow-500 hover:bg-yellow-500 rounded-sm h-8">
                        <Plus className="h-4 w-4 mr-1" /> Create
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isLoading ? <p>Loading...</p> : warehouses.map(w => (
                    <div key={w.id} className="bg-white p-4 border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="bg-blue-50 p-2 rounded text-blue-600">
                                <WarehouseIcon size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-800">{w.name}</h3>
                                <p className="text-xs text-green-600 font-medium">{w.isActive ? 'Active' : 'Inactive'}</p>
                            </div>
                        </div>
                        {w.address && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 pt-2 border-t border-gray-100">
                                <MapPin size={14} />
                                <span>{w.address}</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Warehouse">
                <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Name</label>
                        <Input {...register("name")} className="rounded-sm" />
                        {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-gray-700">Address</label>
                        <Input {...register("address")} className="rounded-sm" />
                    </div>
                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={mutation.isPending} className="bg-yellow-400 hover:bg-yellow-500 text-black">
                            Save
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

import { useState } from 'react';

export default Warehouses;
