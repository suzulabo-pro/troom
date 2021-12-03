export const AnyConverter = {
  toFirestore: (v: any) => v,
  fromFirestore: (s: { data: () => any | undefined }) => s.data(),
};
