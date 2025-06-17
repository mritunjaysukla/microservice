import { Project } from '../../project/entities/project.entity';
export declare enum Fonts {
    ROSCA = "rosca",
    MOONET = "moonet",
    MOCADS = "mocads",
    BALGERI = "balgeri",
    BEYOND_MARS = "beyond-mars",
    GODBER = "godber",
    AMOROUS = "amorous",
    GARIS = "garis",
    LOMBARD = "lombard",
    SINORETA = "sinoreta",
    GAUTER = "gauter",
    MALLISY = "mallisy",
    HENDRIGO = "hendrigo",
    TIARA = "tiara",
    BLACKSWORD = "blacksword",
    LATIN_STUDY = "latin-study",
    CLATTERING = "clattering",
    SAMARKAN = "samarkan",
    QLASSY = "qlassy",
    TAKOTA = "takota",
    WARSASW = "warsasw",
    MONTSERRAT = "montserrat",
    ARIAL = "arial",
    FIGMA_HANDLE = "figma_hand",
    ROBOTO = "roboto"
}
export declare enum PhotoLayout {
    GRID_LAYOUT = "grid-layout",
    PINTEREST_LAYOUT = "pinterest-layout"
}
export declare enum MenuIcon {
    FILLED = "filled",
    DARK = "dark",
    OUTLINED = "outlined"
}
export declare enum ImageGap {
    SMALL = "16px",
    MEDIUM = "32px",
    LARGE = "48px"
}
export declare enum ColorSchema {
    DARK = "#1A0000",
    LIGHT = "#ECECEC",
    DARK_LIGHT = "#767676",
    PINK = "#F5E3E4"
}
export declare enum GalleryHomePageLayout {
    SPLIT_SCREEN = "split-screen",
    OVERLAY_TEXT = "overlay-text",
    FLIPSPLIT_SCREEN = "flip-split-screen"
}
export declare class GallerySetting {
    id: string;
    projectHeader: string;
    projectDescription: string;
    primaryFonts: Fonts;
    secondaryFonts: Fonts;
    photoLayout: PhotoLayout;
    galeryHomePageLayout: GalleryHomePageLayout;
    menuIcon: MenuIcon;
    imageGap: ImageGap;
    colorSchema: ColorSchema;
    projectCover: string;
    project: Project;
    projectId: string;
}
