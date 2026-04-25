// ============================================================
// Banana Pro 场景提示词模板库
// ============================================================

import { getCustomPrompt } from "./prompt-storage"

// ------------------ 场景配置类型 ------------------

export interface RenderConfig {
  style: "natural" | "warm" | "cool" | "luxury"
  addFigure: boolean
  figureEffect: "blur" | "clear"
  quality: "2k" | "4k" | "8k"
  customRequirements: string
}

export interface FloorplanConfig {
  style: string
  language: "zh" | "en" | "bilingual"
}

export interface ColorAnalysisConfig {
  theme: "minimal" | "dark" | "warm"
  language: "zh" | "en" | "bilingual"
}

export interface FurnitureBreakdownConfig {
  background: "white" | "gray" | "beige"
  language: "zh" | "en" | "bilingual"
  layout: "scattered" | "grid"
}

export interface MaterialAnalysisConfig {
  language: "zh" | "en" | "bilingual"
}

export interface StoryboardConfig {
  theme: "daily" | "artistic" | "commercial"
  language: "zh" | "en" | "bilingual"
}

export interface FloorplanTo3DConfig {
  area: "living" | "bedroom" | "dining" | "study"
  style: "modern-luxury" | "mid-century" | "cream" | "neo-chinese" | "industrial"
}

export interface SpatialAnalysisConfig {
  language: "zh" | "en" | "bilingual"
}

export interface FurnitureLayoutConfig {
  style: "bauhaus" | "modern" | "nordic" | "japanese"
  roomType: "living" | "bedroom" | "dining"
}

export interface ElevationConfig {
  style: "revit" | "sketch" | "minimal"
  language: "zh" | "en" | "bilingual"
}

export interface AxonometricConfig {
  language: "zh" | "en" | "bilingual"
}

export type SceneConfig =
  | RenderConfig
  | FloorplanConfig
  | ColorAnalysisConfig
  | FurnitureBreakdownConfig
  | MaterialAnalysisConfig
  | StoryboardConfig
  | FloorplanTo3DConfig
  | SpatialAnalysisConfig
  | FurnitureLayoutConfig
  | ElevationConfig
  | AxonometricConfig

// ------------------ 场景列表 ------------------

export const SCENES = [
  {
    id: "render",
    title: "渲染增强",
    description: "SU截图秒变写实摄影级效果图",
    icon: "Palette",
    color: "#E85D4C",
  },
  {
    id: "floorplan",
    title: "彩平图生成",
    description: "平面图一键生成多风格彩平",
    icon: "Grid3x3",
    color: "#4A90D9",
  },
  {
    id: "floorplan-to-3d",
    title: "户型转3D",
    description: "平面图生成指定区域效果图",
    icon: "Box",
    color: "#3498DB",
  },
  {
    id: "color-analysis",
    title: "颜色搭配分析",
    description: "智能解析空间配色方案",
    icon: "Pipette",
    color: "#9B59B6",
  },
  {
    id: "material-analysis",
    title: "材质分析",
    description: "家具材质指引与性能对比",
    icon: "Layers",
    color: "#1ABC9C",
  },
  {
    id: "furniture-breakdown",
    title: "软装拆解",
    description: "一键提取所有家具单品",
    icon: "LayoutGrid",
    color: "#27AE60",
  },
  {
    id: "furniture-layout",
    title: "智能布局",
    description: "毛坯房一键布置软装方案",
    icon: "Sofa",
    color: "#E67E22",
  },
  {
    id: "elevation",
    title: "立面产品图",
    description: "家具立面图与尺寸标注",
    icon: "Ruler",
    color: "#2C3E50",
  },
  {
    id: "axonometric",
    title: "3D轴测图",
    description: "爆炸图展示家具搭配关系",
    icon: "Box",
    color: "#16A085",
  },
  {
    id: "spatial-analysis",
    title: "尺度分析",
    description: "空间尺度与人体工学分析",
    icon: "Move",
    color: "#8E44AD",
  },
  {
    id: "storyboard",
    title: "室内分镜",
    description: "生成9宫格空间摄影分镜",
    icon: "Film",
    color: "#C0392B",
  },
  {
    id: "edit",
    title: "自由修图",
    description: "上传图片自由编辑与生成",
    icon: "Wand2",
    color: "#F39C12",
  },
] as const

export type SceneId = (typeof SCENES)[number]["id"]

// ------------------ 默认配置 ------------------

export const DEFAULT_CONFIGS: Record<string, Record<string, any>> = {
  render: { style: "natural", addFigure: false, figureEffect: "blur", quality: "4k", customRequirements: "" },
  floorplan: { style: "hand-drawn", language: "bilingual" },
  "color-analysis": { theme: "minimal", language: "bilingual" },
  "furniture-breakdown": { background: "white", language: "en", layout: "scattered" },
  "material-analysis": { language: "bilingual" },
  storyboard: { theme: "artistic", language: "bilingual" },
  "floorplan-to-3d": { area: "living", style: "modern-luxury" },
  "spatial-analysis": { language: "bilingual" },
  "furniture-layout": { style: "modern", roomType: "living" },
  elevation: { style: "revit", language: "bilingual" },
  axonometric: { language: "bilingual" },
}

// ------------------ 各场景默认提示词构建函数 ------------------

function buildRenderPrompt(config: RenderConfig): string {
  const parts: string[] = [
    `核心约束：
{"几何保真度": "严格保持原始场景的空间结构、物体位置、墙体轮廓、门窗尺寸与几何形状，严禁修改空间布局、物体比例与相对位置"}
{"物体完整性": "完整保留所有家具、灯具、装饰品、软装的原始样式、尺寸比例、造型细节与摆放关系，不新增、不删除、不简化任何物体"}
{"严禁增物": "绝对禁止在场景中添加任何原图中不存在的物品、家具、装饰、植物、灯具、人物或其他物体。不得凭空增加台灯、花瓶、书籍、抱枕等任何细节"}
{"转换逻辑": "将基础模型面精准转换为高精度PBR物理材质，包含真实反射、粗糙度、法线、金属度、凹凸纹理，完全符合现实物理光学规律"}

场景与光效：{"环境光": "柔和自然天光从窗外外景均匀射入，窗户区域允许自然高光曝光，光线层次细腻、过渡柔和，形成真实空间漫反射","室内光": "所有室内人工暖光源全部开启，暖光色温3000K-3500K，照度微弱且氛围感强，形成多层次立体照明，明暗过渡自然，无死黑区域"}

摄影参数：{"相机型号": "尼康Z9","光圈": "f/8","快门": "1s", "感光度": "ISO 64", "拍摄技术": "HDR高动态范围拍摄，包围曝光，暗部细节完整保留，亮部不过曝，色彩自然通透，动态范围宽广", "镜头": "24-70mm f/2.8 专业室内摄影镜头"}

渲染精度：{"画面表现": "以自然光为主光源，整体光照均匀柔和，顶级写实室内摄影风格，画面通透干净、质感真实、细节极度丰富","画质要求": "8K超高清，无噪点，无锯齿，光影物理准确，材质质感细腻，空间纵深感强，专业商业室内摄影级别"}`,
  ]

  const styleMap: Record<string, string> = {
    natural: "保持自然写实风格，中性色温，真实还原材质本色。",
    warm: "色温偏暖3500K，增加暖色氛围光，木质纹理更温暖，整体营造温馨舒适的居家氛围。",
    cool: "色温偏冷5000K，增加冷色反射，金属质感更突出，整体呈现现代冷峻的高级感。",
    luxury: "增加镜面反射，提升材质光泽度，增加景深效果，整体呈现奢华高端的空间气质。",
  }
  parts.push(`风格倾向：${styleMap[config.style] || styleMap.natural}`)

  if (config.addFigure) {
    const figureDesc = config.figureEffect === "blur"
      ? "室内添加1个人物，长曝光形成虚焦，人物自然融入场景，不遮挡主要家具。"
      : "室内添加1个人物，人物清晰呈现，自然融入场景，与空间产生互动感。"
    parts.push(`人物：${figureDesc}`)
  }

  const qualityMap: Record<string, string> = { "2k": "2K高清输出", "4k": "4K超高清输出", "8k": "8K极致超高清输出" }
  parts.push(`输出要求：${qualityMap[config.quality] || qualityMap["4k"]}`)

  if (config.customRequirements?.trim()) {
    parts.push(`\n定制化要求（严格在原图已有物品基础上执行，不得因此新增任何物体）：\n${config.customRequirements.trim()}`)
  }

  return parts.join("\n\n")
}

function buildFloorplanPrompt(config: FloorplanConfig): string {
  const styleMap: Record<string, string> = {
    "hand-drawn": `手绘质感室内彩平图，橙色粗体墙体轮廓，米色/浅木色基础地面色调，客餐厅区域使用浅橙色地面区分，卫浴区蓝白小方格瓷砖，卧室与功能区搭配浅棕/奶咖色底色，点缀绿色圆形绿植、白色极简人物剪影、黑色弧形箭头指示，手写体英文功能标注（Bedroom、Bathroom等），粗糙纸张纹理背景，高对比度，扁平插画风，细节清晰`,
    marker: `手绘马克笔风格室内彩平图，墙体使用鲜明的绿色轮廓线，功能区填充浅蓝、浅灰等柔和分区底色，橙色与蓝色手绘线条，白色粗糙纸张纹理背景，线条干净清晰，高对比度，专业建筑图纸质感，保持户型比例精准无变形`,
    "mid-century": `专业级别2D彩色平面图，无透视、无轴测、无变形，比例精准，中古风。暖棕/奶咖色底色，深棕木地板（人字拼），客餐厅橙色沙发，卧室复古绿色床品，格纹图案装饰，胡桃木家具，黄铜金属点缀，整体温暖怀旧`,
    "neo-chinese": `专业室内设计彩色平面图，原始户型结构、门窗位置、房间尺寸、墙体布局完全不变，融合中式竹影、宣纸水墨元素，新中式禅意风格彩平图，整体效果：户型主体清晰突出，内部纹理极淡，背景水墨竹影做弱对比氛围，画面干净高级，专业设计师商用彩平，比例精准，无变形`,
    cartoon: `治愈系卡通彩平图，现代大平层户型平面图，扁平插画风格，暖橙色墙体线条，分区高饱和色彩填充，深棕木纹地板+黑色客餐厅地面，点缀彩色家具剪影、白色小人与绿植，干净清爽的白色背景，简约可爱的设计感，专业建筑图纸质感，无多余元素`,
    cream: `专业级别2D彩色平面图，无透视、无轴测、无变形，比例精准，奶油风。暖米色/奶油色基调，浅木色家具，浅棕色地板，白色卫浴，整体柔和温馨，低饱和度配色，圆润家具造型`,
    "marble-gray": `严格保持空间和家具位置轮廓不变，转换为室内平面图。客厅地面使用深灰大理石，卫生间厨房地面使用浅灰大理石，地垫使用浅灰色，卧室地面使用浅棕色斜拼木板。家具白色。背景白色，墙体窗户保持样式不变`,
    "flat-minimal": `严格保持空间和家具位置轮廓不变，转换为室内平面图，2D扁平风格。客厅卧室浅灰色，卧室叠加淡显黑色竖向线条0.1pt，地垫填充灰色，卫生间和厨房填充浅灰蓝色。家具白色，添加白色平面活动线稿人。背景白色。墙体有少量阴影。保持样式不变`,
  }

  const langMap: Record<string, string> = {
    zh: "所有标注使用中文。",
    en: "所有标注使用英文。",
    bilingual: "所有标注使用中英双语。",
  }

  return `俯视图，专业建筑户型平面图。严格保留原始户型结构与线稿，无透视、无轴测、无变形，比例精准。墙体轮廓清晰，门窗位置不变，房间布局不变，家具位置不变。8K超高清，细节清晰，专业设计师商用级别。

${styleMap[config.style] || styleMap["hand-drawn"]}

${langMap[config.language] || langMap.bilingual}`
}

function buildColorAnalysisPrompt(config: ColorAnalysisConfig): string {
  const themeMap: Record<string, string> = {
    minimal: "白色背景，极简理性风格",
    dark: "深色背景，高端奢华风格",
    warm: "暖色背景，温馨柔和风格",
  }
  const langMap: Record<string, string> = {
    zh: "使用中文输出",
    en: "使用英文输出",
    bilingual: "使用中英双语输出",
  }
  return `请基于上传的室内空间图片，生成一张「颜色搭配分析图」。

画面内容结构必须包含以下模块：
1. 颜色模块分析：明确区分主色调、辅色调、点缀色。每个颜色以「色块+HEX色值」形式呈现。每个色块下方标注对应的空间元素。
2. 色彩平衡与点缀：使用圆环图或比例图展示整体配色结构，清楚体现中性色为背景，彩色作为视觉焦点的逻辑。
3. 局部色彩体验：提取3-4个局部空间细节图，每个局部配一句简短关键词说明。
4. 色彩心理氛围：用一段简短文字总结空间气质，说明颜色如何影响情绪、空间感与居住体验。

整体视觉：单张完整分析展板，建筑设计分析图风格，${themeMap[config.theme] || themeMap.minimal}。比例精准，排版专业，信息层级清晰。${langMap[config.language] || langMap.bilingual}。`
}

function buildFurnitureBreakdownPrompt(config: FurnitureBreakdownConfig): string {
  const bgMap: Record<string, string> = { white: "白色", gray: "浅灰", beige: "米色" }
  const langMap: Record<string, string> = { zh: "中文", en: "英文", bilingual: "中英双语" }
  const layoutMap: Record<string, string> = { scattered: "错落有致", grid: "网格对齐" }

  return `将图像中的家具提取并分解为一张整洁的${bgMap[config.background]}背景拼贴画。
每件家具均单独展示，并附有${langMap[config.language]}名称。
各元素以${layoutMap[config.layout]}的方式排列，彼此之间既无干扰也无重叠。
无需考虑天花板、墙壁或地板的存在；仅展示家具本身，从而保持了整体温暖而中性的美学基调。

要求：
- 识别并提取所有可见的软装家具和装饰品
- 包括但不限于：沙发、椅子、桌子、灯具、地毯、挂画、绿植、装饰品
- 每件单品清晰可辨，无裁切
- 保留家具原始色彩
- 排版美观，间距均匀，具有设计杂志感`
}

function buildMaterialAnalysisPrompt(config: MaterialAnalysisConfig): string {
  const langMap: Record<string, string> = {
    zh: "使用中文输出",
    en: "使用英文输出",
    bilingual: "使用中英双语输出",
  }
  return `分析生成一份室内家具材质分析图，室内设计排版样式，分为2部分。

第一部分：原图材质指引
- 在原图上将家具材质用引线标注出来
- 每个标注搭配材质纹理图标和特性说明

第二部分：材质性能分析表
- 行：材质类型（真皮、大理石、金属、羊毛地毯、织物等）
- 列：耐用性、维护难度、质感表现、环保等级
- 每个单元格给出具体评级和简要说明

视觉风格：专业住宅室内分析示意图风格，线条利落精准，信息层级清晰。${langMap[config.language] || langMap.bilingual}。`
}

function buildStoryboardPrompt(config: StoryboardConfig): string {
  const themeMap: Record<string, string> = {
    daily: "日常生活氛围，温暖自然",
    artistic: "艺术电影氛围，光影诗意",
    commercial: "商业摄影氛围，精致高级",
  }
  const langMap: Record<string, string> = {
    zh: "使用中文标注",
    en: "使用英文标注",
    bilingual: "使用中英双语标注",
  }
  return `你是顶级空间摄影师，分析图一的空间结构、光线和装修风格，生成一组9个有艺术氛围的导演分镜。

要求：
- 摄影镜头级别，可包含局部特写
- 严格保持空间结构、氛围、布局不变
- 要有故事性和连续性
- 构图多样：全景、中景、特写交替
- 光影保持与原图一致
- ${themeMap[config.theme] || themeMap.artistic}

输出：9宫格排列的单张图片，每张分镜下方标注镜头描述。${langMap[config.language] || langMap.bilingual}。`
}

function buildFloorplanTo3DPrompt(config: FloorplanTo3DConfig): string {
  const areaMap: Record<string, string> = { living: "客厅", bedroom: "卧室", dining: "餐厅", study: "书房" }
  const styleMap: Record<string, string> = {
    "modern-luxury": "现代轻奢风格，大理石与金属元素，精致高级",
    "mid-century": "中古风，胡桃木与皮革，温暖怀旧",
    cream: "奶油风，暖米色基调，柔和温馨",
    "neo-chinese": "新中式，水墨意境，东方韵味",
    industrial: "工业风，裸露结构，复古质感",
  }
  return `基于上传的平面户型图，生成一张户型平面图中红框内的【${areaMap[config.area] || areaMap.living}区域】的4K室内效果图。

核心约束：
- 必须保持房间布局和软硬装家具布置与户型平面图一致
- 风格和空间氛围保持一致
- 家具位置、空间比例与平面图精准对应
- 硬装（墙面、地面、门窗位置）保持不变

风格要求：${styleMap[config.style] || styleMap["modern-luxury"]}

输出：单张4K超高清室内效果图，真实材质，自然光影，专业室内摄影质感。`
}

function buildSpatialAnalysisPrompt(config: SpatialAnalysisConfig): string {
  const langMap: Record<string, string> = {
    zh: "使用中文标注",
    en: "使用英文标注",
    bilingual: "使用中英双语标注",
  }
  return `分析平面内容生成室内空间尺度分析图，保持空间结构和家具位置不变。

以室内设计排版的方式，分为四部分：

1. 尺度标注：
- 平面图各区域边缘添加精确尺寸数字 + 尺寸线
- 标注房间开间、进深、层高

2. 人体工学示意：
- 在关键区域（厨房、卫生间、客厅）放置标准化的人体姿态简图
- 包括：站立、坐姿、弯腰操作
- 与之叠加标注，直观呈现人与空间、家具的尺度关系

3. 家具配置：
- 各功能区匹配对应家具（客厅沙发组、餐厅桌椅、卧室床具等）
- 标注关键家具尺寸

4. 尺度对比示意图：
- 下方展示四组 "1:1 人体模型 + 家具" 的尺度对比示意图
- 包括：厨房操作区、卫浴设施、客厅休息区、卧室空间

视觉风格：专业住宅室内尺度分析示意图风格，配色与平面相似，线条利落精准，信息层级清晰，突出"居住功能+人体尺度适配"的逻辑，符合住宅室内设计规范的工程分析类图示。${langMap[config.language] || langMap.bilingual}。`
}

function buildFurnitureLayoutPrompt(config: FurnitureLayoutConfig): string {
  const styleMap: Record<string, string> = {
    bauhaus: "包豪斯风格，几何造型，红黄蓝配色点缀",
    modern: "现代简约风格， clean lines，中性色调",
    nordic: "北欧风格，明亮通透，自然材料",
    japanese: "日式禅意，原木色调，留白空间",
  }
  const roomMap: Record<string, string> = { living: "客厅", bedroom: "卧室", dining: "餐厅" }
  return `基于上传的室内毛坯房照片，保持相机视角和空间结构不变，将其装修成全新的${roomMap[config.roomType] || roomMap.living}。

设计要求：
- ${styleMap[config.style] || styleMap.modern}
- 家具布置合理，符合居家生活规律
- 墙面和吊顶装饰
- 植物和灯光搭配
- 增加落地灯、挂画、绿植、地毯等软装搭配
- 真实的材质细节，材质表面真实反射
- 明亮的室内光线，高级摄影感
- 按照原图的尺寸比例生成

输出：单张4K超高清室内效果图。`
}

function buildElevationPrompt(config: ElevationConfig): string {
  const styleMap: Record<string, string> = {
    revit: "Revit建模模型风格，干净利落的轮廓线，柔和的中性色调填充，呈现现代室内空间的技术图纸感",
    sketch: "手绘线稿风格，轻松自然的笔触，略带草图质感",
    minimal: "极简CAD风格，纯黑白线条，无填充，极致精确",
  }
  const langMap: Record<string, string> = {
    zh: "使用中文标注",
    en: "使用英文标注",
    bilingual: "使用中英双语标注",
  }
  return `生成图中所有家具的立面产品图。

要求：
- 标注精确尺寸（宽×深×高）
- ${styleMap[config.style] || styleMap.revit}
- 整体风格克制、精致，充满专业设计感
- 表达所有家具和装饰
- 保持家具与装饰的原色彩
- 包含正视图、侧视图（如有必要）
- 排版整齐，信息层级清晰

输出：单张完整的产品立面图集。${langMap[config.language] || langMap.bilingual}。`
}

function buildAxonometricPrompt(config: AxonometricConfig): string {
  const langMap: Record<string, string> = {
    zh: "使用中文标注",
    en: "使用英文标注",
    bilingual: "使用中英双语标注",
  }
  return `分析生成一份住宅空间家居搭配分析图，以3D立体轴测角度的爆炸图展示。

要求：
- 清晰标注每件家具的名称
- 给出配色参考
- 每个材质的纹理缩略图在右侧
- 各部分均配有清晰标注，注明结构名称与功能说明
- 整体布局兼具专业性与视觉逻辑性
- 呈现出清晰、整洁且极具科技感的解析示意图
- 写实风格，配有简单背景
- 家具之间适当拉开距离，展示空间关系

输出：单张完整的3D轴测爆炸分析图。${langMap[config.language] || langMap.bilingual}。`
}

// ------------------ 主入口 ------------------

export function buildPrompt(scene: string, config: Record<string, any>): string {
  // 优先使用自定义提示词
  const custom = getCustomPrompt(scene)
  if (custom) {
    return custom
  }

  switch (scene) {
    case "render":
      return buildRenderPrompt(config as RenderConfig)
    case "floorplan":
      return buildFloorplanPrompt(config as FloorplanConfig)
    case "color-analysis":
      return buildColorAnalysisPrompt(config as ColorAnalysisConfig)
    case "furniture-breakdown":
      return buildFurnitureBreakdownPrompt(config as FurnitureBreakdownConfig)
    case "material-analysis":
      return buildMaterialAnalysisPrompt(config as MaterialAnalysisConfig)
    case "storyboard":
      return buildStoryboardPrompt(config as StoryboardConfig)
    case "floorplan-to-3d":
      return buildFloorplanTo3DPrompt(config as FloorplanTo3DConfig)
    case "spatial-analysis":
      return buildSpatialAnalysisPrompt(config as SpatialAnalysisConfig)
    case "furniture-layout":
      return buildFurnitureLayoutPrompt(config as FurnitureLayoutConfig)
    case "elevation":
      return buildElevationPrompt(config as ElevationConfig)
    case "axonometric":
      return buildAxonometricPrompt(config as AxonometricConfig)
    default:
      return config.customPrompt || ""
  }
}

/**
 * 获取某个场景使用默认配置时的完整提示词（用于设置页面展示默认值）
 */
export function getDefaultPrompt(scene: string): string {
  const config = DEFAULT_CONFIGS[scene] || {}
  // 绕过自定义提示词，直接获取默认
  switch (scene) {
    case "render":
      return buildRenderPrompt(config as RenderConfig)
    case "floorplan":
      return buildFloorplanPrompt(config as FloorplanConfig)
    case "color-analysis":
      return buildColorAnalysisPrompt(config as ColorAnalysisConfig)
    case "furniture-breakdown":
      return buildFurnitureBreakdownPrompt(config as FurnitureBreakdownConfig)
    case "material-analysis":
      return buildMaterialAnalysisPrompt(config as MaterialAnalysisConfig)
    case "storyboard":
      return buildStoryboardPrompt(config as StoryboardConfig)
    case "floorplan-to-3d":
      return buildFloorplanTo3DPrompt(config as FloorplanTo3DConfig)
    case "spatial-analysis":
      return buildSpatialAnalysisPrompt(config as SpatialAnalysisConfig)
    case "furniture-layout":
      return buildFurnitureLayoutPrompt(config as FurnitureLayoutConfig)
    case "elevation":
      return buildElevationPrompt(config as ElevationConfig)
    case "axonometric":
      return buildAxonometricPrompt(config as AxonometricConfig)
    default:
      return ""
  }
}
