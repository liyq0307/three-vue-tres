/*
 * 通用镜面地板的可序列化配置。
 * 贴图字段只保存 URL 或 Data URL，便于编辑器导入、导出和生成插件源码。
 */

import type { Texture } from 'three'

export interface TextureRepeatValue {
    x: number
    y: number
}

export interface MeshReflectionFloorProps {
    materialProps?: Record<string, unknown>
    resolution?: number
    mix?: number
    sharpMix?: number
    sharpDepthScale?: number
    sharpDepthBias?: number
    sharpDepthEdgeMin?: number
    sharpDepthEdgeMax?: number
    blurMixSmooth?: number
    blurMixRough?: number
    blurDepthScale?: number
    blurDepthBias?: number
    blurDepthEdgeMin?: number
    blurDepthEdgeMax?: number
    blurSize?: number | [number, number]
    reflectorOffset?: number
    color?: string
    roughness?: number
    metalness?: number
    map?: Texture | null
    mapIntensity?: number
    normalMap?: Texture | null
    normalIntensity?: number
    normalScale?: number | [number, number] | TextureRepeatValue
    distortionMap?: Texture | null
    distortion?: number
    mapSource?: string
    useLocalMap?: boolean
    mapLocalData?: string
    normalMapSource?: string
    useLocalNormalMap?: boolean
    normalMapLocalData?: string
    distortionMapSource?: string
    useLocalDistortionMap?: boolean
    distortionMapLocalData?: string
    textureRepeat?: TextureRepeatValue
    textureRotation?: number
}

export const meshReflectionFloorMapOptions = [
    { label: '无底色贴图', value: '' },
    {
        label: '砖地板 04',
        value: 'https://asset-manager.icegl.cn/assets/textures/brick_floor_04_diff_1k.jpg',
    },
    {
        label: '湿混凝土地板',
        value: 'https://asset-manager.icegl.cn/assets/textures/concrete_wet_floor_basecolor.jpg',
    },
    {
        label: '瓷砖',
        value: 'https://asset-manager.icegl.cn/assets/images/tiles.jpg',
    },
]

export const meshReflectionFloorNormalMapOptions = [
    { label: '无法线贴图', value: '' },
    {
        label: '湿混凝土地板法线',
        value: 'https://asset-manager.icegl.cn/assets/textures/concrete_wet_floor_normal.jpg',
    },
    {
        label: '瓷砖',
        value: 'https://asset-manager.icegl.cn/assets/images/tiles.jpg',
    },
]

export const meshReflectionFloorDistortionMapOptions = [
    { label: '无扰动贴图', value: '' },
    {
        label: 'Water DUDV',
        value: 'https://asset-manager.icegl.cn/assets/textures/waterdudv.jpg',
    },
]

export const meshReflectionFloorDefaults = {
    resolution: 256,
    mix: 0.27,
    sharpMix: 0,
    sharpDepthScale: 0.43,
    sharpDepthBias: 0,
    sharpDepthEdgeMin: 0,
    sharpDepthEdgeMax: 0.2,
    blurMixSmooth: 0.11,
    blurMixRough: 3.04,
    blurDepthScale: 0.8,
    blurDepthBias: 0,
    blurDepthEdgeMin: 0,
    blurDepthEdgeMax: 0.2,
    blurSize: 0,
    reflectorOffset: -0.022,
    color: '#232323',
    roughness: 1,
    metalness: 0,
    mapIntensity: 0.15,
    normalIntensity: 3.15,
    distortion: 0.16,
    mapSource: meshReflectionFloorMapOptions[3].value,
    useLocalMap: false,
    mapLocalData: '',
    normalMapSource: meshReflectionFloorNormalMapOptions[2].value,
    useLocalNormalMap: false,
    normalMapLocalData: '',
    distortionMapSource: meshReflectionFloorDistortionMapOptions[1].value,
    useLocalDistortionMap: false,
    distortionMapLocalData: '',
    textureRepeat: { x: 1, y: 1 },
    textureRotation: 0,
} as const

export function createMeshReflectionFloorState(overrides: Partial<MeshReflectionFloorProps> = {}) {
    return {
        ...meshReflectionFloorDefaults,
        textureRepeat: { ...meshReflectionFloorDefaults.textureRepeat },
        ...overrides,
    }
}

const imageFileConfig = {
    com: 'fileData',
    accept: 'image/*',
    maxSize: 1024 * 1024,
} as const

export const meshReflectionFloorEditorConfig = {
    name: '通用镜面地板',
    type: 'meshReflectionFloor',
    pluginPath: 'PLS/floor',
    vueFile: 'PLS/floor/components/meshReflectionFloor.vue',
    previewPath: './plugins/floor/preview/meshReflectionFloor.png',
    default: createMeshReflectionFloorState(),
    defaultObject3D: {
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
    },
    config: {
        color: { name: '地板颜色', com: 'ColorPicker' },
        roughness: { name: '粗糙度', com: 'Slider', min: 0, max: 1, step: 0.01 },
        metalness: { name: '金属度', com: 'Slider', min: 0, max: 1, step: 0.01 },
        resolution: {
            name: '反射分辨率',
            com: 'Select',
            options: [256, 512, 1024, 2048].map((value) => ({ label: String(value), value })),
        },
        mix: { name: '整体反射强度', com: 'Slider', min: 0, max: 5, step: 0.01 },
        sharpMix: { name: '清晰反射强度', com: 'Slider', min: 0, max: 5, step: 0.01 },
        sharpDepthScale: { name: '清晰深度范围', com: 'Slider', min: 0, max: 5, step: 0.01 },
        sharpDepthBias: { name: '清晰深度偏移', com: 'Slider', min: -1, max: 1, step: 0.001 },
        sharpDepthEdgeMin: { name: '清晰衰减起点', com: 'Slider', min: 0, max: 1, step: 0.001 },
        sharpDepthEdgeMax: { name: '清晰衰减终点', com: 'Slider', min: 0, max: 1, step: 0.001 },
        blurMixSmooth: { name: '光滑面模糊强度', com: 'Slider', min: 0, max: 5, step: 0.01 },
        blurMixRough: { name: '粗糙面模糊强度', com: 'Slider', min: 0, max: 5, step: 0.01 },
        blurDepthScale: { name: '模糊深度范围', com: 'Slider', min: 0, max: 5, step: 0.01 },
        blurDepthBias: { name: '模糊深度偏移', com: 'Slider', min: -1, max: 1, step: 0.001 },
        blurDepthEdgeMin: { name: '模糊扩散起点', com: 'Slider', min: 0, max: 1, step: 0.001 },
        blurDepthEdgeMax: { name: '模糊扩散终点', com: 'Slider', min: 0, max: 1, step: 0.001 },
        blurSize: { name: '模糊尺寸', com: 'Slider', min: 0, max: 500, step: 1 },
        reflectorOffset: { name: '反射面偏移', com: 'Slider', min: -1, max: 1, step: 0.001 },
        mapSource: { name: '在线底色贴图', com: 'Select', options: meshReflectionFloorMapOptions },
        useLocalMap: { name: '使用本地底色', com: 'Switch' },
        mapLocalData: { name: '本地底色贴图', ...imageFileConfig },
        mapIntensity: { name: '底色贴图强度', com: 'Slider', min: 0, max: 1, step: 0.01 },
        normalMapSource: { name: '在线法线贴图', com: 'Select', options: meshReflectionFloorNormalMapOptions },
        useLocalNormalMap: { name: '使用本地法线', com: 'Switch' },
        normalMapLocalData: { name: '本地法线贴图', ...imageFileConfig },
        normalIntensity: { name: '法线贴图强度', com: 'Slider', min: 0, max: 5, step: 0.01 },
        distortionMapSource: { name: '在线扰动贴图', com: 'Select', options: meshReflectionFloorDistortionMapOptions },
        useLocalDistortionMap: { name: '使用本地扰动', com: 'Switch' },
        distortionMapLocalData: { name: '本地扰动贴图', ...imageFileConfig },
        distortion: { name: '扰动贴图强度', com: 'Slider', min: 0, max: 5, step: 0.01 },
        textureRepeat: {
            name: '底色/法线重复',
            com: 'numberList',
            data: [
                { t: 'x', decimal: 2 },
                { t: 'y', decimal: 2 },
            ],
        },
        textureRotation: { name: '底色/法线旋转', com: 'Slider', min: -Math.PI, max: Math.PI, step: 0.01 },
    },
}
