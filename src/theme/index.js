export const colors = {
  cream: '#FFF8F0',
  primary: '#5B3427',
  peach: '#E8A17C',
  caramel: '#C78B55',
  blush: '#F8C8CF',
  white: '#FFFFFF',
  text: '#3E2723',
  muted: '#8D6E63',
  border: '#F0DFD2',
  danger: '#C0392B',
};

export const cardShadow = {
  elevation: 3,
  shadowColor: '#5B3427',
  shadowOffset: {width: 0, height: 2},
  shadowOpacity: 0.1,
  shadowRadius: 5,
};

export const formatPKR = amount =>
  `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;

export default colors;