import { useEffect, useState } from "react";
import { View } from "react-native";
import { ACTIVITY } from "@f7/content";
import { Body } from "@/components/ui";
import { Chips, NumberField, Segmented } from "@/components/Pickers";
import type { Activity, Sex } from "@/state/session";

export type Numbers = { heightCm?: number; age?: number; sex?: Sex; activity?: Activity };

const ACTIVITIES = (Object.keys(ACTIVITY) as Activity[]).map((id) => ({ id, label: ACTIVITY[id].label }));

/**
 * "Your numbers" — height, age, sex, how often you train. Used by onboarding
 * step 4 and Settings → Training. Only range checks; every field optional,
 * and the target simply stays hidden until all four are in.
 */
export function NumbersForm({ value, onChange, autoFocus }: { value: Numbers; onChange: (v: Numbers) => void; autoFocus?: boolean }) {
  const [height, setHeight] = useState(value.heightCm ? String(value.heightCm) : "");
  const [age, setAge] = useState(value.age ? String(value.age) : "");

  useEffect(() => {
    const h = Number(height);
    const a = Number(age);
    onChange({
      ...value,
      heightCm: h >= 120 && h <= 230 ? h : undefined,
      age: a >= 13 && a <= 90 ? a : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [height, age]);

  const heightBad = height.length >= 3 && (Number(height) < 120 || Number(height) > 230);
  const ageBad = age.length >= 2 && (Number(age) < 13 || Number(age) > 90);

  return (
    <View style={{ gap: 18 }}>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>HEIGHT</Body>
          <NumberField value={height} onChange={setHeight} unit="cm" placeholder="170" label="Height in centimetres" autoFocus={autoFocus} />
          {heightBad ? <Body size="micro" style={{ marginTop: 6 }}>120–230 cm</Body> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>AGE</Body>
          <NumberField value={age} onChange={setAge} unit="years" placeholder="28" label="Age in years" maxLen={2} />
          {ageBad ? <Body size="micro" style={{ marginTop: 6 }}>13–90</Body> : null}
        </View>
      </View>

      <View>
        <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>SEX</Body>
        <Segmented
          value={value.sex}
          options={[
            { id: "female", label: "Female" },
            { id: "male", label: "Male" },
          ]}
          onChange={(sex) => onChange({ ...value, sex })}
        />
        <Body size="micro" style={{ marginTop: 6 }}>USED ONLY FOR THE ENERGY FORMULA</Body>
      </View>

      <View>
        <Body size="micro" style={{ letterSpacing: 1.4, marginBottom: 8 }}>HOW OFTEN YOU TRAIN</Body>
        <Chips value={value.activity} options={ACTIVITIES} onChange={(activity) => onChange({ ...value, activity })} />
      </View>
    </View>
  );
}
