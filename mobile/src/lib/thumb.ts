import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

/**
 * Pick or shoot a photo and shrink it to a small JPEG data URI (≈15–30 KB)
 * that can live in AsyncStorage. Used for progress photos and past snaps;
 * nothing is uploaded. Returns null if the member cancels or says no to the
 * permission.
 */
export async function pickThumb(from: "camera" | "library", size = 360): Promise<{ thumb: string } | { error: string } | null> {
  try {
    if (from === "camera") {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return { error: "Camera access is off. Allow it in Settings, or pick from your gallery." };
    }
    const res =
      from === "camera"
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ["images"], quality: 0.8, exif: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], quality: 0.8, exif: false, allowsMultipleSelection: false });
    if (res.canceled || !res.assets?.[0]) return null;
    return { thumb: await toThumb(res.assets[0].uri, res.assets[0].width, res.assets[0].height, size) };
  } catch {
    return { error: "Couldn't open the photo. Try again." };
  }
}

export async function toThumb(uri: string, width?: number, height?: number, size = 360): Promise<string> {
  const landscape = (width ?? 1) >= (height ?? 1);
  const out = await manipulateAsync(uri, [{ resize: landscape ? { width: size } : { height: size } }], { compress: 0.6, format: SaveFormat.JPEG, base64: true });
  return `data:image/jpeg;base64,${out.base64}`;
}
