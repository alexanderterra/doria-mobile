import { BANNER_TAMANHOS } from "@/constants/bannerTamanhos";
import { bannersService } from "@/services/banners/bannersService";
import { Banner, BannerLocal, BannerPublico } from "@/types/banners";
import { isSafeUrl } from "@/utils/url";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageStyle,
  Linking,
  Pressable,
  StyleProp,
  ViewStyle,
} from "react-native";

interface BannerSlotProps {
  local: BannerLocal;
  publicoAlvo?: BannerPublico;
  style?: StyleProp<ViewStyle>;
}

export function BannerSlot({ local, publicoAlvo, style }: BannerSlotProps) {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    let ativo = true;
    bannersService.getBannerParaLocal(local, publicoAlvo).then((res) => {
      if (ativo) setBanner(res);
    });
    return () => {
      ativo = false;
    };
  }, [local, publicoAlvo]);

  if (!banner) return null;

  const tamanho = BANNER_TAMANHOS[local];
  const aspectRatio = tamanho ? tamanho.largura / tamanho.altura : undefined;

  const imagem = (
    <Image
      source={{ uri: banner.imagem_url }}
      style={[
        { width: "100%", aspectRatio, borderRadius: 12 } as ImageStyle,
        style as StyleProp<ImageStyle>,
      ]}
      resizeMode="cover"
      accessibilityLabel={banner.texto_alternativo}
    />
  );

  if (!banner.link_destino || !isSafeUrl(banner.link_destino)) return imagem;

  const destino = banner.link_destino;
  return (
    <Pressable onPress={() => Linking.openURL(destino).catch(() => {})}>
      {imagem}
    </Pressable>
  );
}
