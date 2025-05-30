import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import { Franchise } from '@/types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { franchiseService } from '../../services/franchiseService';
import Modal from 'react-native-modal';
import { TextInput } from 'react-native';
import MapView, { Marker, Polygon, LatLng } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import Constants from 'expo-constants';
import { adminService } from "@/services/adminService";






const FranchiseManagement = () => {
  const { colors } = useTheme();
  const [franchises, setFranchises] = useState<Franchise[]>([]);
  const [loading, setLoading] = useState(false);

 const [showModal, setShowModal] = useState(false);
 const [editingFranchise, setEditingFranchise] = useState<Franchise | null>(null);
 const [allLocations, setAllLocations] = useState([]);
 const [franchiseForm, setFranchiseForm] = useState({
   name: '',
   phone: '',
   email: '',
   address: '',
   city: '',
   state: '',
   zip_code: '',
   location_ids: [],
 });



  const fetchFranchises = async () => {
    try {
      setLoading(true);
     const raw = await adminService.getAllFranchises();

     const data = raw.map((f: any) => ({
       id: f.ID, // ✅ remap the field
       name: f.name,
       phone: f.phone,
       email: f.email,
       address: f.address,
       city: f.city,
       state: f.state,
       zip_code: f.zip_code,
       isActive: f.is_active,
       approval_state: f.approval_state,
       service_area: f.service_area,
       owner_id: f.owner_id,
       createdAt: f.CreatedAt,
       updatedAt: f.UpdatedAt,
     }));

     console.log("🔥 Mapped Franchises:", data);
     setFranchises(data);

      console.log("🔥 AdminService returned franchises:", data); // Add this
      setFranchises(data);
    } catch (err) {
      console.error('Error fetching franchises:', err);
      Alert.alert('Error', 'Failed to load franchises');
    } finally {
      setLoading(false);
    }
  };


  // ✅ Add fetchLocations right below that 👇
  const fetchLocations = async () => {
    try {
     const data = await franchiseService.getFranchiseLocations();
      console.log("📍 Locations fetched:", data);
      setAllLocations(data);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  useEffect(() => {
    fetchFranchises();
    fetchLocations(); // ✅ Call it here to load locations into dropdown
  }, []);

  const handleDelete = async (id: number) => {
    Alert.alert('Confirm', 'Are you sure you want to delete?', [
      { text: 'Cancel' },
      {
        text: 'Delete',
        onPress: async () => {
          try {
            await franchiseService.deleteFranchise(id);
            Alert.alert('Success', 'Franchise deleted');
            fetchFranchises();
          } catch (err) {
            Alert.alert('Error', 'Delete failed');
          }
        },
      },
    ]);
  };

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await franchiseService.toggleFranchiseStatus(id, newStatus);
      Alert.alert('Success', `Franchise ${newStatus ? 'activated' : 'deactivated'}`);
      fetchFranchises();
    } catch (err) {
      Alert.alert('Error', 'Status update failed');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await franchiseService.approveFranchise(id);
      Alert.alert('Success', 'Franchise approved');
      fetchFranchises();
    } catch (err) {
      Alert.alert('Error', 'Approval failed');
    }
  };

 const handleEdit = (franchise: Franchise) => {
   openEditFranchise(franchise);
 };

const openAddFranchise = () => {
  setEditingFranchise(null);
  setFranchiseForm({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    location_ids: [], // ✅ Include this
  });

  setShowModal(true);
};

const openEditFranchise = (franchise: Franchise) => {
  setEditingFranchise(franchise);
 setFranchiseForm({
   name: franchise.name,
   phone: franchise.phone,
   email: franchise.email,
   address: franchise.address,
   city: franchise.city,
   state: franchise.state,
   zip_code: franchise.zip_code,
   location_ids: franchise.location_ids || [], // ✅ include this
 });
};



const handleSaveFranchise = async () => {
  try {
    if (editingFranchise) {
      await franchiseService.updateFranchise(editingFranchise.id, franchiseForm);
      Alert.alert('Success', 'Franchise updated');
    } else {
      await franchiseService.createFranchise(franchiseForm);
      Alert.alert('Success', 'Franchise created');
    }
    setShowModal(false);
    fetchFranchises();
  } catch (err) {
    console.error('Save error', err);
    Alert.alert('Error', 'Failed to save franchise');
  }
};
      console.log("🧪 Franchises arriving in UI:", franchises);
return (
  <>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Button
        title="Add Franchise"
        onPress={openAddFranchise}
        style={{ marginBottom: 12 }}
      />
      <Text style={[styles.title, { color: colors.text }]}>Franchise Management</Text>
      console.log("🧪 Franchises arriving in UI:", franchises);

     {franchises.map((f, index) => {
       return (
         <Card key={index} style={{ backgroundColor: colors.card }}>
           <Text style={[styles.name, { color: colors.text }]}>{f.name}</Text>
           <Text style={{ color: colors.textSecondary }}>
             {f.city}, {f.state}
           </Text>
           <Text style={{ color: colors.textSecondary }}>Phone: {f.phone}</Text>
           <Text style={{ color: colors.textSecondary }}>
             Status: {f.isActive ? "Active" : "Inactive"}
           </Text>
           <Text style={{ color: colors.textSecondary }}>
             Approval: {f.approval_state}
           </Text>
           <Text style={{ color: colors.textSecondary }}>
             Zip: {f.zip_code}
           </Text>
           <Text style={{ color: colors.textSecondary }}>
             Area: {f.service_area}
           </Text>

           <View style={styles.buttonRow}>
             <Button title="Edit" onPress={() => handleEdit(f)} />
             <Button
               title={f.isActive ? "Deactivate" : "Activate"}
               variant="outline"
               onPress={() => {
                 console.log("🟢 Toggling Status for:", f.id);
                 handleToggleStatus(f.id, !f.isActive);
               }}
             />
             <Button
               title="Delete"
               variant="danger"
               onPress={() => {
                 console.log("🗑 Deleting Franchise ID:", f.id);
                 handleDelete(f.id);
               }}
             />
           </View>

           {f.approval_state === "pending" && (
             <View style={{ marginTop: 8 }}>
               <Button
                 title="Approve"
                 onPress={() => {
                   console.log("✅ Approving Franchise:", f.id);
                   handleApprove(f.id);
                 }}
               />
             </View>
           )}
         </Card> // ✅ you were missing this closing tag!
       );
     })}

    </ScrollView>

  <Modal isVisible={showModal} onBackdropPress={() => setShowModal(false)}>
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        {editingFranchise ? 'Edit Franchise' : 'Add Franchise'}
      </Text>

      {/* Text Inputs */}
      {['name', 'phone', 'email', 'address', 'city', 'state', 'zip_code'].map((field) => (
        <TextInput
          key={field}
          placeholder={field.replace('_', ' ').toUpperCase()}
          value={(franchiseForm as any)[field]}
          onChangeText={(text) =>
            setFranchiseForm((prev) => ({ ...prev, [field]: text }))
          }
          style={{
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 5,
            padding: 10,
            marginBottom: 10,
          }}
        />
      ))}

      {/* Service Area Assignment */}
      <Text style={{ fontWeight: 'bold', marginBottom: 6 }}>Assign Service Areas</Text>
      {allLocations.map((area) => (
        <TouchableOpacity
          key={area.id}
          style={{
            borderWidth: 1,
            borderColor: franchiseForm.location_ids.includes(area.id) ? 'green' : '#ccc',
            padding: 8,
            borderRadius: 6,
            marginBottom: 6,
          }}
          onPress={() => {
            const isSelected = franchiseForm.location_ids.includes(area.id);
            const updated = isSelected
              ? franchiseForm.location_ids.filter((id) => id !== area.id)
              : [...franchiseForm.location_ids, area.id];
            setFranchiseForm((prev) => ({ ...prev, location_ids: updated }));
          }}
        >
          <Text style={{ color: franchiseForm.location_ids.includes(area.id) ? 'green' : 'black' }}>
            {area.name} ({area.zipCodes?.join(', ')})
          </Text>
        </TouchableOpacity>
      ))}

      {/* Action Buttons */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
        <Button title="Cancel" variant="outline" onPress={() => setShowModal(false)} />
        <Button title="Save" onPress={handleSaveFranchise} />
      </View>
    </View>
  </Modal>


  </>
);

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
});

export default FranchiseManagement;
