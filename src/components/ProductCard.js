import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {colors, cardShadow, formatPKR} from '../theme';

const TILE = {
  Cakes: '#FFD9C0',
  Cupcakes: '#F8C8CF',
  Donuts: '#F3C9A5',
  Bread: '#E8B77A',
  Cookies: '#FFE3CC',
  Pastries: '#FFD0C8',
};

export default function ProductCard({product, onEdit, onDelete}) {
  // ---------------------------------------------------------
  // TODO (your logic): look at product.quantity and decide:
  //   label      -> 'Low', 'Out', or '' (no badge)
  //   badgeStyle -> styles.lowBadge or styles.outBadge
  //   textStyle  -> styles.lowText  or styles.outText
  // ---------------------------------------------------------
  let label = '';
  let badgeStyle = null;
  let textStyle = null;

  return (
    <View style={styles.card}>
      <View
        style={[
          styles.tile,
          {backgroundColor: TILE[product.category] || colors.peach},
        ]}>
        <Text style={styles.emoji}>{product.emoji}</Text>
      </View>

      <Text style={styles.name} numberOfLines={1}>
        {product.name}
      </Text>
      <Text style={styles.meta}>
        {product.category} · Qty {product.quantity}
      </Text>

      {/* Fixed-height row, so cards stay the same size with or without a badge */}
      <View style={styles.badgeRow}>
        {label !== '' && (
          <View style={[styles.badge, badgeStyle]}>
            <Text style={[styles.badgeText, textStyle]}>{label}</Text>
          </View>
        )}
      </View>

      <Text style={styles.price}>{formatPKR(product.price)}</Text>

      <View style={styles.row}>
        <TouchableOpacity style={styles.editBtn} onPress={onEdit}>
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.delBtn} onPress={onDelete}>
          <Text style={styles.delText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FBE3D2',
    ...cardShadow,
  },
  tile: {
    height: 92,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {fontSize: 46},
  name: {fontSize: 14, fontWeight: '800', color: colors.text, marginTop: 8},
  meta: {fontSize: 12, color: colors.muted, marginTop: 2},

  // Badge styles (ready to use)
  badgeRow: {height: 24, justifyContent: 'center', marginTop: 4},
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {fontSize: 11, fontWeight: '800'},
  lowBadge: {backgroundColor: colors.peach},
  lowText: {color: colors.danger},
  outBadge: {backgroundColor: colors.danger},
  outText: {color: colors.white},

  price: {fontSize: 14, fontWeight: '800', color: colors.primary},
  row: {flexDirection: 'row', gap: 6, marginTop: 8},
  editBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.peach,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editText: {fontSize: 12, fontWeight: '700', color: colors.text},
  delBtn: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delText: {fontSize: 12, fontWeight: '700', color: colors.white},
});