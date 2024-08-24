export type Prettify<T extends Record<string, any>> = {
  [Key in keyof T]: T[Key]
} & {}

export type MergeObject<T, U> = Omit<T, keyof U> & U
export type MergeObjectPrettify<T, U> = Prettify<MergeObject<T, U>>
