import { useEffect, useState } from "react";
import { View } from "react-native";
import { ACTIVITY } from "@f7/content";
import { Body } from "@/components/ui";
import { Chips, NumberField, Segmented } from "@/components/Pickers";
import type { Activity, Sex } from "@/state/session";

export type Numbers = { kg?: number; heightCm?: number; age?: number; sex?: Sex; activity?: Activity };

const ACTIVITIES = (Object.keys(ACTIVITY) as Activity[]).map((id) => ({ id, label: ACTIVITY[id].label }));

/**
 * "Your numbers" — weight, height, age, sex, how often you train. Used by
 * onboarding step 4 and Settings → Training. Only range checks; every field
 * optional, and the target simply stays hidden until all five are in.
 * Weight here is today's weigh-in (same as Progress), so both screens agree.
 */
export function NumbersForm({ value, onChange, autoFocus }: { value: Numbers; onChange: (v: Numbers) => void; autoFocus?: boolean }) {
  const [weight, setWeight] = useState(value.kg ? String(value.kg) : "");
  const [height, setHeight] = useState(value.heightCm ? String(value.heightCm) : "");
  const [age, setAge] = useState(value.age ? String(value.age) : "");

  // The member record can arrive after first paint (cache → server); fill
  // any box the user hasn't typed in yet from the saved numbers.
  useEffect(() => {
    if (!weight && value.kg) setWeight(String(value.kg));
    if (!height && value.heightCm) setHeight(String(value.heightCm));
    if (!age && value.age) setAge(String(value.age));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value.kg, value.heightCm, value.age]);

  useEffect(() => {
    const w = Number(weight);
    const h = Number(height);
    const a = Number(age);
    onChange({
      ...value,
      kg: w >= 30 && w <= 250 ? Math.round(w * 10) / 10 : undefined,
      heightCm: h >= 120 && h <= 230 ? h : undefined,
      age: a >= 13 && a <= 90 ? a : undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weight, height, age]);

  const weightBad = weight.length >= 2 && !(Number(weight) >= 30 && Number(weight) <= 250);
  const heightBad = height.length >= 3 && (Number(height) < 120 || Number(height) > 230);
  const ageBad = age.length >= 2 && (Number(age) < 13 || Number(age) > 90);

  return (
    <View style={{ gap: 18 }}>
      <View>
        <Body size="micro" style={{ marginBottom: 8 }}>Weight today</Body>
        <NumberField value={weight} onChange={setWeight} unit="kg" placeholder="70" label="Weight in kilograms" maxLen={5} decimal autoFocus={autoFocus} />
        {weightBad ? <Body size="micro" style={{ marginTop: 6 }}>30–250 kg</Body> : null}
      </View>
      <View style={{ flexDirection: "row", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Body size="micro" style={{ marginBottom: 8 }}>Height</Body>
          <NumberField value={height} onChange={setHeight} unit="cm" placeholder="170" label="Height in centimetres" />
          {heightBad ? <Body size="micro" style={{ marginTop: 6 }}>120–230 cm</Body> : null}
        </View>
        <View style={{ flex: 1 }}>
          <Body size="micro" style={{ marginBottom: 8 }}>Age</Body>
          <NumberField value={age} onChange={setAge} unit="years" placeholder="28" label="Age in years" maxLen={2} />
          {ageBad ? <Body size="micro" style={{ marginTop: 6 }}>13–90</Body> : null}
        </View>
      </View>

      <View>
        <Body size="micro" style={{ marginBottom: 8 }}>Sex</Body>
        <Segmented
          value={value.sex}
          options={[
            { id: "female", label: "Female" },
            { id: "male", label: "Male" },
          ]}
          onChange={(sex) => onChange({ ...value, sex })}
        />
        <Body size="micro" style={{ marginTop: 6 }}>Used only for the energy formula</Body>
      </View>

      <View>
        <Body size="micro" style={{ marginBottom: 8 }}>How often you train</Body>
        <Chips value={value.activity} options={ACTIVITIES} onChange={(activity) => onChange({ ...value, activity })} />
      </View>
    </View>
  );
}
