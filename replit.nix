{pkgs}: {
  deps = [
    pkgs.xorg.libxcb
    pkgs.xorg.libXrandr
    pkgs.xorg.libXfixes
    pkgs.xorg.libXext
    pkgs.xorg.libXdamage
    pkgs.xorg.libXcomposite
    pkgs.xorg.libX11
    pkgs.alsa-lib
    pkgs.mesa
    pkgs.libdrm
    pkgs.cups
    pkgs.nss
    pkgs.chromium
  ];
}
