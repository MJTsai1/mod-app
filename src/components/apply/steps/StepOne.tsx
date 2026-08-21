"use client";

import { useMemo } from "react";
import { TextInput, SelectInput } from "@/components/apply/fields";
import {
  UNINHABITED_TIMEZONE,
  type ApplicationFormValues,
  type FormErrors,
} from "@/components/apply/formTypes";

/** "GMT+1" / "GMT+0" / "GMT-5" (as returned by Intl's shortOffset) -> "UTC+1" / "UTC" / "UTC-5". */
function gmtToUtcLabel(gmtOffset: string): string {
  return gmtOffset.replace(/^GMT\+0$/, "UTC").replace(/^GMT/, "UTC");
}

function offsetLabelFor(timeZone: string, date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const offsetPart = parts.find((part) => part.type === "timeZoneName");
  return gmtToUtcLabel(offsetPart?.value ?? "UTC");
}

/** Minutes east of UTC, e.g. "GMT+05:30" -> 330, "GMT-04:00" -> -240. Used for sorting only. */
function offsetMinutesFor(timeZone: string, date: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const offsetPart = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offsetPart);
  if (!match) return 0;
  const [, sign, hours, minutes] = match;
  const total = Number(hours) * 60 + Number(minutes);
  return sign === "-" ? -total : total;
}

interface TimezoneOption {
  value: string;
  label: string;
}

function useTimezoneOptions(): TimezoneOption[] {
  return useMemo(() => {
    let zones: string[];
    try {
      zones = Intl.supportedValuesOf("timeZone");
    } catch {
      // Intl.supportedValuesOf isn't available in this browser; fall back
      // to just the applicant's own detected zone so the field still works.
      try {
        zones = [Intl.DateTimeFormat().resolvedOptions().timeZone];
      } catch {
        zones = [];
      }
    }

    // UTC-12 (the "nautical" zone) has no permanent population, so it's
    // absent from Intl's zone list entirely. Etc/GMT+12 is the real IANA
    // identifier for it (Etc/GMT sign convention is inverted) — include it
    // for completeness of the -12..+14 range, with a label that's honest
    // about why it's there.
    if (zones.length > 0 && !zones.includes(UNINHABITED_TIMEZONE)) {
      zones = [UNINHABITED_TIMEZONE, ...zones];
    }

    const year = new Date().getFullYear();
    // Jan 15 / Jul 15 land safely away from any DST transition in either
    // hemisphere, so each reliably captures one of the two offsets a zone
    // observes over the year (and both come out equal for non-DST zones).
    const januaryOffsetDate = new Date(Date.UTC(year, 0, 15));
    const julyOffsetDate = new Date(Date.UTC(year, 6, 15));

    return zones
      .map((zone) => {
        let label = zone;
        let sortMinutes = 0;
        try {
          sortMinutes = offsetMinutesFor(zone, januaryOffsetDate);
          if (zone === UNINHABITED_TIMEZONE) {
            label = "No one lives here (UTC-12)";
          } else {
            const januaryOffset = offsetLabelFor(zone, januaryOffsetDate);
            const julyOffset = offsetLabelFor(zone, julyOffsetDate);
            const offsetLabel =
              januaryOffset === julyOffset ? januaryOffset : `${januaryOffset}/${julyOffset}`;
            label = `${zone} (${offsetLabel})`;
          }
        } catch {
          // Keep the plain zone name if offset lookup fails for some reason.
        }
        return { value: zone, label, sortMinutes };
      })
      // UTC-12 first, UTC+14 last; alphabetical within the same offset.
      .sort((a, b) => a.sortMinutes - b.sortMinutes || a.value.localeCompare(b.value))
      .map(({ value, label }) => ({ value, label }));
  }, []);
}

interface StepProps {
  values: ApplicationFormValues;
  errors: FormErrors;
  setField: <K extends keyof ApplicationFormValues>(key: K, value: ApplicationFormValues[K]) => void;
  discordUsername: string;
  discordUserId: string | null;
}

export function StepOne({ values, errors, setField, discordUsername, discordUserId }: StepProps) {
  const timezoneOptions = useTimezoneOptions();

  return (
    <div>
      <div className="mb-5 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-bg-elevated)] px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">
          Applying as
        </p>
        <p className="mt-1 text-sm font-medium text-[var(--color-text)]">
          {discordUsername}
          {discordUserId && (
            <span className="ml-2 font-mono text-xs text-[var(--color-text-subtle)]">
              {discordUserId}
            </span>
          )}
        </p>
        <p className="field-hint mt-1">
          Taken from your Discord sign-in — not editable here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <TextInput
          label="Age"
          value={values.age}
          onChange={(v) => setField("age", v.replace(/[^0-9]/g, ""))}
          required
          type="number"
          inputMode="numeric"
          placeholder="e.g. 19"
          error={errors.age}
        />
        <TextInput
          label="Country"
          value={values.country}
          onChange={(v) => setField("country", v)}
          required
          placeholder="e.g. Singapore"
          autoComplete="country-name"
          hint="Auto-detected from your location — change it if it's wrong."
          error={errors.country}
        />
        <SelectInput
          label="Timezone"
          value={values.timezone}
          onChange={(v) => setField("timezone", v)}
          options={timezoneOptions}
          required
          placeholder="Select your timezone"
          hint="Auto-detected from your browser — change it if it's wrong."
          error={errors.timezone}
        />
        <TextInput
          label="How long have you been in the server?"
          value={values.timeInServer}
          onChange={(v) => setField("timeInServer", v)}
          required
          placeholder="e.g. 8 months"
          error={errors.timeInServer}
        />
      </div>
    </div>
  );
}
