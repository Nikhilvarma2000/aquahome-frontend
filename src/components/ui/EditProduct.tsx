import React, { useState, useEffect } from 'react';
import { View, TextInput, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';

export default function EditProduct() {
  const route = useRoute();
  const navigation = useNavigation();
  const { id } = route.params;

  const [product, setProduct] = useState({
    name: '',
    price: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    axios.get(`http://your-backend-url/api/products/${id}`)
      .then(response => {
        setProduct(response.data.product);
      })
      .catch(error => {
        console.error('Failed to fetch product', error);
      });
  }, [id]);

  const handleChange = (field, value) => {
    setProduct({ ...product, [field]: value });
  };

  const handleSubmit = () => {
    setError('');
    setSuccess('');

    if (!product.name || !product.price || !product.description) {
      setError('Please fill all fields');
      return;
    }

    setLoading(true);

    axios.put(`http://your-backend-url/api/products/${id}`, product)
      .then(response => {
        setSuccess('Product updated successfully!');
        setLoading(false);
        // navigation.goBack(); // Optionally back to previous screen
      })
      .catch(error => {
        console.error('Failed to update product', error);
        setError('Failed to update product');
        setLoading(false);
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Product</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="Product Name"
        value={product.name}
        onChangeText={(text) => handleChange('name', text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Product Price"
        value={product.price.toString()}
        keyboardType="numeric"
        onChangeText={(text) => handleChange('price', text)}
      />
      <TextInput
        style={styles.textarea}
        placeholder="Product Description"
        value={product.description}
        multiline
        numberOfLines={4}
        onChangeText={(text) => handleChange('description', text)}
      />

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <Button title="Update Product" onPress={handleSubmit} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 16,
    height: 100,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
  success: {
    color: 'green',
    marginBottom: 10,
  },
});
