// Minimal stub declarations to satisfy TypeScript without real native modules

declare module "react" {
  export type FC<P = any> = (props: P) => any;
  export function useState<T = any>(initial?: T): [T, (v: T) => void];
  export function useEffect(effect: (...args: any[]) => any, deps?: any[]): void;
  export function useMemo<T = any>(factory: () => T, deps?: any[]): T;
  export function useContext<T = any>(ctx: any): T;
  export function createContext<T = any>(init: T): any;
  export function useRef<T = any>(val?: T): { current: T };
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps?: any[]): T;
  export type ReactNode = any;
  const React: any;
  export default React;
}

declare module "react-native" {
  export const View: any;
  export const Text: any;
  export const StyleSheet: any;
  export const StatusBar: any;
  export const Pressable: any;
  export const TextInput: any;
  export const FlatList: any;
  export const ScrollView: any;
  export const ActivityIndicator: any;
  export const Alert: any;
  export const RefreshControl: any;
  export const Animated: any;
  export const Easing: any;
  export const Platform: any;
  export const Switch: any;
  export type ViewStyle = any;
  export type ViewProps = any;
  export type AccessibilityValue = any;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
  type Element = any;
}

declare module "react-native-safe-area-context" {
  export const SafeAreaView: any;
}

declare module "@react-native-async-storage/async-storage" {
  const AsyncStorage: any;
  export = AsyncStorage;
}

declare module "react-native-svg" {
  export function Svg(props: any): any;
  export default Svg;
  export function G(props: any): any;
  export function Circle(props: any): any;
  export function Path(props: any): any;
  export function Rect(props: any): any;
}

declare module "expo-sqlite/legacy" {
  export type WebSQLDatabase = any;
  export type SQLTransaction = any;
  export function openDatabase(name: string): any;
}

declare module "expo-document-picker" {
  const DocumentPicker: any;
  export = DocumentPicker;
}

declare module "papaparse" {
  export function parse<T = any>(input: string, opts?: any): { data: T[] };
  const Papa: { parse: typeof parse };
  export default Papa;
}

declare module "expo-file-system" {
  const FileSystem: any;
  export = FileSystem;
}

declare module "expo-sharing" {
  const Sharing: any;
  export = Sharing;
}
