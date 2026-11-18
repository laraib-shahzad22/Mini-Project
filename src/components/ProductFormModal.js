
import React, {useState, useEffect} from 'react';

import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  StyleSheet,
  Alert,
} from 'react-native';

import {colors} from '../theme';

const CATEGORIES = [
  'Cakes',
  'Cupcakes',
  'Donuts',
  'Bread',
  'Cookies',
  'Pastries',
];

const EMOJIS = ['🍰', '🧁', '🍩', '🍞', '🍪', '🥐'];

export default function ProductFormModal({
  visible,
  product,
  onClose,
  onSave,
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Cakes');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [emoji, setEmoji] = useState('🍰');

  // Fill form when editing, reset form when adding
  useEffect(() => {
    if (visible && product) {
      setName(product.name);
      setCategory(product.category);
      setPrice(String(product.price));
      setQuantity(String(product.quantity));
      setEmoji(product.emoji);
    } else if (visible) {
      setName('');
      setCategory('Cakes');
      setPrice('');
      setQuantity('');
      setEmoji('🍰');
    }
  }, [visible, product]);

  // Validate and save product
  const handleSave = () => {
    const cleanName = name.trim();

    if (!cleanName) {
      Alert.alert('Error', 'Please enter product name');
      return;
    }

    if (
      price.trim() === '' ||
      !/^\d+(\.\d+)?$/.test(price.trim()) ||
      Number(price) < 0
    ) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (
      quantity.trim() === '' ||
      !/^\d+$/.test(quantity.trim())
    ) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    // Send data to parent screen
    onSave({
      name: cleanName,
      category,
      price: Number(price),
      quantity: Number(quantity),
      emoji,
    });
  };

  const isEdit = !!product;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>

      <KeyboardAvoidingView
        style={styles.overlay}
        behavior="padding">

        <View style={styles.sheet}>
          <Text style={styles.title}>
            {isEdit ? 'Edit product' : 'Add new product'}
          </Text>

          <ScrollView
            contentContainerStyle={styles.form}
            keyboardShouldPersistTaps="handled">

            <Text style={styles.label}>Name</Text>

            <TextInput
              style={styles.input}
              placeholder="e.g. Chocolate Cake"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Category</Text>

            <View style={styles.wrap}>
              {CATEGORIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.chip,
                    category === c && styles.chipOn,
                  ]}
                  onPress={() => setCategory(c)}>

                  <Text
                    style={[
                      styles.chipText,
                      category === c && styles.chipTextOn,
                    ]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.twoCols}>
              <View style={{flex: 1}}>
                <Text style={styles.label}>Price (PKR)</Text>

                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={price}
                  onChangeText={setPrice}
                />
              </View>

              <View style={{flex: 1}}>
                <Text style={styles.label}>Quantity</Text>

                <TextInput
                  style={styles.input}
                  placeholder="0"
                  placeholderTextColor={colors.muted}
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />
              </View>
            </View>

            <Text style={styles.label}>Picture</Text>

            <View style={styles.wrap}>
              {EMOJIS.map(e => (
                <TouchableOpacity
                  key={e}
                  style={[
                    styles.emojiBtn,
                    emoji === e && styles.emojiOn,
                  ]}
                  onPress={() => setEmoji(e)}>

                  <Text style={styles.emoji}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>

          </ScrollView>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[styles.btn, {backgroundColor: colors.peach}]}
              onPress={onClose}>

              <Text style={[styles.btnText, {color: colors.text}]}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, {backgroundColor: colors.primary}]}
              onPress={handleSave}>

              <Text style={[styles.btnText, {color: colors.white}]}>
                {isEdit ? 'Save changes' : 'Add product'}
              </Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(59,32,22,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    maxHeight: '90%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 8,
  },
  form: {gap: 8, paddingBottom: 10},
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginTop: 6,
  },
  input: {
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 18,
    fontSize: 14,
    color: colors.text,
  },
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    height: 40,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  chipTextOn: {color: colors.white},
  twoCols: {flexDirection: 'row', gap: 12},
  emojiBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emojiOn: {
    borderColor: colors.primary,
    backgroundColor: colors.peach,
  },
  emoji: {fontSize: 26},
  buttons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
