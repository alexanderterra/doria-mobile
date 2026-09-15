import { isSafeUrl } from "@/utils/url";
import * as Linking from "expo-linking";
import React from "react";
import { StyleProp, Text, TextStyle } from "react-native";

interface FormattedTextProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

type TextSegment =
  | { type: "plain"; content: string }
  | { type: "bold"; content: string }
  | { type: "italic"; content: string }
  | { type: "link"; content: string; href: string };

function parseFormattedText(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const TOKEN_RE = /\*\*(.+?)\*\*|\*(.+?)\*|<a\s+href="([^"]+)">(.+?)<\/a>/gs;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TOKEN_RE.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "plain",
        content: text.slice(lastIndex, match.index),
      });
    }

    if (match[1] !== undefined) {
      segments.push({ type: "bold", content: match[1] });
    } else if (match[2] !== undefined) {
      segments.push({ type: "italic", content: match[2] });
    } else if (match[3] !== undefined && match[4] !== undefined) {
      segments.push({ type: "link", content: match[4], href: match[3] });
    }

    lastIndex = TOKEN_RE.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "plain", content: text.slice(lastIndex) });
  }

  return segments;
}

export function FormattedText({ text, style }: FormattedTextProps) {
  const segments = parseFormattedText(text);

  return (
    <Text style={style}>
      {segments.map((seg, index) => {
        switch (seg.type) {
          case "bold":
            return (
              <Text key={index} style={{ fontWeight: "bold" }}>
                {seg.content}
              </Text>
            );
          case "italic":
            return (
              <Text key={index} style={{ fontStyle: "italic" }}>
                {seg.content}
              </Text>
            );
          case "link":
            return (
              <Text
                key={index}
                style={{
                  color: "#3B82F6",
                  textDecorationLine: "underline",
                  fontWeight: "600",
                }}
                onPress={() => {
                  if (isSafeUrl(seg.href)) Linking.openURL(seg.href);
                }}
              >
                {seg.content}
              </Text>
            );
          default:
            return <Text key={index}>{seg.content}</Text>;
        }
      })}
    </Text>
  );
}
