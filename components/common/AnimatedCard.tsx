import React, { useEffect, useRef } from "react";
import { Animated, Dimensions, StyleProp, ViewStyle } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

interface AnimatedCardProps {
  children: React.ReactNode;
  height?: number | string;
  width?: number | string;
  style?: StyleProp<ViewStyle>;
  animationDuration?: number;
  slideFrom?: "bottom" | "top" | "left" | "right";
  fadeIn?: boolean;
  springConfig?: {
    friction?: number;
    tension?: number;
    mass?: number;
  };
  onAnimationComplete?: () => void;
  backgroundColor?: string;
  borderRadius?: number;
  showShadow?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  height = "72%",
  width = "100%",
  style,
  animationDuration = 500,
  slideFrom = "bottom",
  fadeIn = true,
  springConfig = {
    friction: 7,
    tension: 40,
  },
  onAnimationComplete,
  backgroundColor = "#FFFFFF",
  borderRadius = 40,
  showShadow = true,
}) => {
  const getInitialValue = () => {
    switch (slideFrom) {
      case "bottom":
        return 40;
      case "top":
        return -40;
      case "left":
        return -screenWidth;
      case "right":
        return screenWidth;
      default:
        return 40;
    }
  };

  const cardSlide = useRef(new Animated.Value(getInitialValue())).current;
  const cardFade = useRef(new Animated.Value(fadeIn ? 0 : 1)).current;

  useEffect(() => {
    const animations: Animated.CompositeAnimation[] = [];

    if (fadeIn) {
      animations.push(
        Animated.timing(cardFade, {
          toValue: 1,
          duration: animationDuration,
          useNativeDriver: true,
        }),
      );
    }

    animations.push(
      Animated.spring(cardSlide, {
        toValue: 0,
        friction: springConfig.friction ?? 7,
        tension: springConfig.tension ?? 40,
        useNativeDriver: true,
      }),
    );

    Animated.parallel(animations).start(() => {
      onAnimationComplete?.();
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    animationDuration,
    fadeIn,
    springConfig.friction,
    springConfig.tension,
    onAnimationComplete,
  ]);

  const getTransform = () => {
    switch (slideFrom) {
      case "bottom":
        return [{ translateY: cardSlide }];
      case "top":
        return [{ translateY: cardSlide }];
      case "left":
        return [{ translateX: cardSlide }];
      case "right":
        return [{ translateX: cardSlide }];
      default:
        return [{ translateY: cardSlide }];
    }
  };

  const getPosition = () => {
    switch (slideFrom) {
      case "bottom":
        return { bottom: 0 };
      case "top":
        return { top: 0 };
      case "left":
        return { left: 0 };
      case "right":
        return { right: 0 };
      default:
        return { bottom: 0 };
    }
  };

  const getBorderRadius = () => {
    switch (slideFrom) {
      case "bottom":
        return {
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
      case "top":
        return {
          borderBottomLeftRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
        };
      case "left":
        return {
          borderTopRightRadius: borderRadius,
          borderBottomRightRadius: borderRadius,
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
        };
      case "right":
        return {
          borderTopLeftRadius: borderRadius,
          borderBottomLeftRadius: borderRadius,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        };
      default:
        return {
          borderTopLeftRadius: borderRadius,
          borderTopRightRadius: borderRadius,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
        };
    }
  };

  const shadowStyles = showShadow
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: slideFrom === "bottom" ? -4 : 4 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 16,
      }
    : {};

  const getValidDimension = (
    value: number | string,
  ): number | `${number}%` | "auto" => {
    if (typeof value === "number") return value;
    if (value === "auto") return "auto";
    if (value.endsWith("%") && !isNaN(parseFloat(value))) {
      return value as `${number}%`;
    }
    if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    }
    return "auto";
  };

  const validHeight = getValidDimension(height);
  const validWidth = getValidDimension(width);

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          left: 0,
          right: 0,
          ...getPosition(),
          height: validHeight,
          width: validWidth,
          backgroundColor,
          ...getBorderRadius(),
          ...shadowStyles,
          opacity: cardFade,
          transform: getTransform(),
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};
