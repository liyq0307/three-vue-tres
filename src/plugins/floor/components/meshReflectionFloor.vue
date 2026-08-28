<script setup lang="ts">
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import {
    NoColorSpace,
    RepeatWrapping,
    SRGBColorSpace,
    TextureLoader,
    Vector2,
    type ColorSpace,
    type Texture,
} from 'three'
import MeshReflectionMaterial from 'PLS/basic/components/forCientos/meshReflectionMaterial/index.vue'
import {
    meshReflectionFloorDefaults,
    meshReflectionFloorEditorConfig,
    type MeshReflectionFloorProps,
} from '../common/meshReflectionFloor'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MeshReflectionFloorProps>(), {
    materialProps: () => ({}),
    resolution: meshReflectionFloorDefaults.resolution,
    mix: meshReflectionFloorDefaults.mix,
    sharpMix: meshReflectionFloorDefaults.sharpMix,
    sharpDepthScale: meshReflectionFloorDefaults.sharpDepthScale,
    sharpDepthBias: meshReflectionFloorDefaults.sharpDepthBias,
    sharpDepthEdgeMin: meshReflectionFloorDefaults.sharpDepthEdgeMin,
    sharpDepthEdgeMax: meshReflectionFloorDefaults.sharpDepthEdgeMax,
    blurMixSmooth: meshReflectionFloorDefaults.blurMixSmooth,
    blurMixRough: meshReflectionFloorDefaults.blurMixRough,
    blurDepthScale: meshReflectionFloorDefaults.blurDepthScale,
    blurDepthBias: meshReflectionFloorDefaults.blurDepthBias,
    blurDepthEdgeMin: meshReflectionFloorDefaults.blurDepthEdgeMin,
    blurDepthEdgeMax: meshReflectionFloorDefaults.blurDepthEdgeMax,
    blurSize: meshReflectionFloorDefaults.blurSize,
    reflectorOffset: meshReflectionFloorDefaults.reflectorOffset,
    color: meshReflectionFloorDefaults.color,
    roughness: meshReflectionFloorDefaults.roughness,
    metalness: meshReflectionFloorDefaults.metalness,
    mapIntensity: meshReflectionFloorDefaults.mapIntensity,
    normalIntensity: meshReflectionFloorDefaults.normalIntensity,
    distortion: meshReflectionFloorDefaults.distortion,
    mapSource: meshReflectionFloorDefaults.mapSource,
    useLocalMap: meshReflectionFloorDefaults.useLocalMap,
    mapLocalData: meshReflectionFloorDefaults.mapLocalData,
    normalMapSource: meshReflectionFloorDefaults.normalMapSource,
    useLocalNormalMap: meshReflectionFloorDefaults.useLocalNormalMap,
    normalMapLocalData: meshReflectionFloorDefaults.normalMapLocalData,
    distortionMapSource: meshReflectionFloorDefaults.distortionMapSource,
    useLocalDistortionMap: meshReflectionFloorDefaults.useLocalDistortionMap,
    distortionMapLocalData: meshReflectionFloorDefaults.distortionMapLocalData,
    textureRepeat: () => ({ ...meshReflectionFloorDefaults.textureRepeat }),
    textureRotation: meshReflectionFloorDefaults.textureRotation,
})

const emit = defineEmits(['texture-error'])
const textureLoader = new TextureLoader()
const meshRef = shallowRef()
const materialRef = shallowRef()

const mapSource = computed(() => props.useLocalMap && props.mapLocalData ? props.mapLocalData : props.mapSource)
const normalMapSource = computed(() =>
    props.useLocalNormalMap && props.normalMapLocalData ? props.normalMapLocalData : props.normalMapSource,
)
const distortionMapSource = computed(() =>
    props.useLocalDistortionMap && props.distortionMapLocalData
        ? props.distortionMapLocalData
        : props.distortionMapSource,
)

function applyTextureTransform(texture: Texture, colorSpace: ColorSpace, syncSurfaceTransform: boolean) {
    texture.colorSpace = colorSpace
    texture.wrapS = RepeatWrapping
    texture.wrapT = RepeatWrapping
    if (syncSurfaceTransform) {
        texture.repeat.set(props.textureRepeat.x, props.textureRepeat.y)
        texture.center.set(0.5, 0.5)
        texture.rotation = props.textureRotation
    }
    texture.needsUpdate = true
}

function useManagedTexture(
    source: () => string,
    colorSpace: ColorSpace,
    channel: string,
    syncSurfaceTransform = false,
) {
    const texture = shallowRef<Texture | null>(null)
    let requestId = 0

    watch(source, async (value) => {
        const currentRequestId = ++requestId
        const normalizedSource = value?.trim()

        if (!normalizedSource) {
            texture.value?.dispose()
            texture.value = null
            return
        }

        texture.value?.dispose()
        texture.value = null

        try {
            const loadedTexture = await textureLoader.loadAsync(normalizedSource)
            if (currentRequestId !== requestId) {
                loadedTexture.dispose()
                return
            }

            applyTextureTransform(loadedTexture, colorSpace, syncSurfaceTransform)
            texture.value = loadedTexture
        }
        catch (error) {
            if (currentRequestId === requestId) {
                emit('texture-error', { channel, source: normalizedSource, error })
            }
        }
    }, { immediate: true })

    if (syncSurfaceTransform) {
        watch(
            () => [props.textureRepeat.x, props.textureRepeat.y, props.textureRotation],
            () => {
                if (texture.value) applyTextureTransform(texture.value, colorSpace, true)
            },
        )
    }

    onBeforeUnmount(() => {
        requestId++
        texture.value?.dispose()
        texture.value = null
    })

    return texture
}

const managedMap = useManagedTexture(() => mapSource.value, SRGBColorSpace, 'map', true)
const managedNormalMap = useManagedTexture(() => normalMapSource.value, NoColorSpace, 'normalMap', true)
const managedDistortionMap = useManagedTexture(() => distortionMapSource.value, NoColorSpace, 'distortionMap')

const activeMap = computed(() => props.map ?? managedMap.value)
const activeNormalMap = computed(() => props.normalMap ?? managedNormalMap.value)
const activeDistortionMap = computed(() => props.distortionMap ?? managedDistortionMap.value)
const normalScale = computed(() => {
    const value = props.normalScale ?? props.normalIntensity
    if (typeof value === 'number') return new Vector2(value, value)
    if (Array.isArray(value)) return new Vector2(value[0], value[1])
    return new Vector2(value.x, value.y)
})

defineExpose({
    root: meshRef,
    material: materialRef,
    defaults: meshReflectionFloorDefaults,
    editorConfig: meshReflectionFloorEditorConfig,
})
</script>

<template>
    <TresMesh ref="meshRef" :rotation="[-Math.PI / 2, 0, 0]" v-bind="$attrs">
        <TresPlaneGeometry :args="[10, 10]" />
        <MeshReflectionMaterial
            ref="materialRef"
            v-bind="materialProps"
            :resolution="resolution"
            :mix="mix"
            :sharpMix="sharpMix"
            :sharpDepthScale="sharpDepthScale"
            :sharpDepthBias="sharpDepthBias"
            :sharpDepthEdgeMin="sharpDepthEdgeMin"
            :sharpDepthEdgeMax="sharpDepthEdgeMax"
            :blurMixSmooth="blurMixSmooth"
            :blurMixRough="blurMixRough"
            :blurDepthScale="blurDepthScale"
            :blurDepthBias="blurDepthBias"
            :blurDepthEdgeMin="blurDepthEdgeMin"
            :blurDepthEdgeMax="blurDepthEdgeMax"
            :blurSize="blurSize"
            :reflectorOffset="reflectorOffset"
            :color="color"
            :roughness="roughness"
            :metalness="metalness"
            :map="activeMap"
            :mapIntensity="mapIntensity"
            :normalMap="activeNormalMap"
            :normalScale="normalScale"
            :distortionMap="activeDistortionMap"
            :distortion="distortion"
        />
    </TresMesh>
</template>
