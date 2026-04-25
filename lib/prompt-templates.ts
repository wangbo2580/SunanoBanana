// ============================================================
// Banana Pro 场景提示词模板库
// ============================================================

export interface SceneConfig {
  scene: string
  [key: string]: any
}

// ------------------ 渲染增强 ------------------

export interface RenderConfig {
  style: "natural" | "warm" | "cool" | "luxury"
  addFigure: boolean
  figureEffect: "blur" | "clear"
  quality: "2k" | "4k" | "8k"
}

const RENDER_BASE = `核心约束：{"几何保真度": "严格保持原始场景的空间结构、物体位置、墙体轮廓、门窗尺寸与几何形状，严禁修改空间布局、物体比例与相对位置", "物体完整性": "完整保留所有家具、灯具、装饰品、软装的原始样式、尺寸比例、造型细节与摆放关系，不新增、不删除、不简化任何物体","转换逻辑": "将基础模型面精准转换为高精度PBR物理材质，包含真实反射、粗糙度、法线、金属度、凹凸纹理，完全符合现实物理光学规律"}

场景与光效：{"环境光": "柔和自然天光从窗外外景均匀射入，窗户区域允许自然高光曝光，光线层次细腻、过渡柔和，形成真实空间漫反射","室内光": "所有室内人工暖光源全部开启，暖光色温3000K-3500K，照度微弱且氛围感强，形成多层次立体照明，明暗过渡自然，无死黑区域"}

摄影参数：{"相机型号": "尼康Z9","光圈": "f/8","快门": "1s", "感光度": "ISO 64", "拍摄技术": "HDR高动态范围拍摄，包围曝光，暗部细节完整保留，亮部不过曝，色彩自然通透，动态范围宽广", "镜头": "24-70mm f/2.8 专业室内摄影镜头"}

渲染精度：{"画面表现": "以自然光为主光源，整体光照均匀柔和，顶级写实室内摄影风格，画面通透干净、质感真实、细节极度丰富","画质要求": "8K超高清，无噪点，无锯齿，光影物理准确，材质质感细腻，空间纵深感强，专业商业室内摄影级别"}`

const RENDER_STYLE_MAP: Record<string, string> = {
  natural: "保持自然写实风格，中性色温，真实还原材质本色。",
  warm: "色温偏暖3500K，增加暖色氛围光，木质纹理更温暖，整体营造温馨舒适的居家氛围。",
  cool: "色温偏冷5000K，增加冷色反射，金属质感更突出，整体呈现现代冷峻的高级感。",
  luxury: "增加镜面反射，提升材质光泽度，增加景深效果，整体呈现奢华高端的空间气质。",
}

function buildRenderPrompt(config: RenderConfig): string {
  const parts: string[] = [RENDER_BASE]
  parts.push(`风格倾向：${RENDER_STYLE_MAP[config.style] || RENDER_STYLE_MAP.natural}`)

  if (config.addFigure) {
    const figureDesc =
      config.figureEffect === "blur"
        ? "室内添加1个人物，长曝光形成虚焦，人物自然融入场景，不遮挡主要家具。"
        : "室内添加1个人物，人物清晰呈现，自然融入场景，与空间产生互动感。"
    parts.push(`人物：${figureDesc}`)
  }

  const qualityMap: Record<string, string> = {
    "2k": "2K高清输出",
    "4k": "4K超高清输出",
    "8k": "8K极致超高清输出",
  }
  parts.push(`输出要求：${qualityMap[config.quality] || qualityMap["4k"]}`)

  return parts.join("\n\n")
}

// ------------------ 彩平图 ------------------

export interface FloorplanConfig {
  style: string
  language: "zh" | "en" | "bilingual"
}

const FLOORPLAN_BASE = `俯视图，专业建筑户型平面图。严格保留原始户型结构与线稿，无透视、无轴测、无变形，比例精准。墙体轮廓清晰，门窗位置不变，房间布局不变，家具位置不变。8K超高清，细节清晰，专业设计师商用级别。`

const FLOORPLAN_STYLE_MAP: Record<string, string> = {
  "hand-drawn": `手绘质感室内彩平图，橙色粗体墙体轮廓，米色/浅木色基础地面色调，客餐厅区域使用浅橙色地面区分，卫浴区蓝白小方格瓷砖，卧室与功能区搭配浅棕/奶咖色底色，点缀绿色圆形绿植、白色极简人物剪影、黑色弧形箭头指示，手写体英文功能标注（Bedroom、Bathroom等），粗糙纸张纹理背景，高对比度，扁平插画风，细节清晰`,
  marker: `手绘马克笔风格室内彩平图，墙体使用鲜明的绿色轮廓线，功能区填充浅蓝、浅灰等柔和分区底色，橙色与蓝色手绘线条，白色粗糙纸张纹理背景，线条干净清晰，高对比度，专业建筑图纸质感，保持户型比例精准无变形`,
  "mid-century": `专业级别2D彩色平面图，无透视、无轴测、无变形，比例精准，中古风。暖棕/奶咖色底色，深棕木地板（人字拼），客餐厅橙色沙发，卧室复古绿色床品，格纹图案装饰，胡桃木家具，黄铜金属点缀，整体温暖怀旧`,
  "neo-chinese": `专业室内设计彩色平面图，原始户型结构、门窗位置、房间尺寸、墙体布局完全不变，融合中式竹影、宣纸水墨元素，新中式禅意风格彩平图，整体效果：户型主体清晰突出，内部纹理极淡，背景水墨竹影做弱对比氛围，画面干净高级，专业设计师商用彩平，比例精准，无变形`,
  cartoon: `治愈系卡通彩平图，现代大平层户型平面图，扁平插画风格，暖橙色墙体线条，分区高饱和色彩填充，深棕木纹地板+黑色客餐厅地面，点缀彩色家具剪影、白色小人与绿植，干净清爽的白色背景，简约可爱的设计感，专业建筑图纸质感，无多余元素`,
  cream: `专业级别2D彩色平面图，无透视、无轴测、无变形，比例精准，奶油风。暖米色/奶油色基调，浅木色家具，浅棕色地板，白色卫浴，整体柔和温馨，低饱和度配色，圆润家具造型`,
  "marble-gray": `严格保持空间和家具位置轮廓不变，转换为室内平面图。客厅地面使用深灰大理石，卫生间厨房地面使用浅灰大理石，地垫使用浅灰色，卧室地面使用浅棕色斜拼木板。家具白色。背景白色，墙体窗户保持样式不变`,
  "flat-minimal": `严格保持空间和家具位置轮廓不变，转换为室内平面图，2D扁平风格。客厅卧室浅灰色，卧室叠加淡显黑色竖向线条0.1pt，地垫填充灰色，卫生间和厨房填充浅灰蓝色。家具白色，添加白色平面活动线稿人。背景白色。墙体有少量阴影。保持样式不变`,
}

function buildFloorplanPrompt(config: FloorplanConfig): string {
  const parts: string[] = [FLOORPLAN_BASE]
  parts.push(FLOORPLAN_STYLE_MAP[config.style] || FLOORPLAN_STYLE_MAP["hand-drawn"])

  const langMap: Record<string, string> = {
    zh: "所有标注使用中文。",
    en: "所有标注使用英文。",
    bilingual: "所有标注使用中英双语。",
  }
  parts.push(langMap[config.language] || langMap.bilingual)

  return parts.join("\n\n")
}

// ------------------ 颜色搭配分析 ------------------

export interface ColorAnalysisConfig {
  theme: "minimal" | "dark" | "warm"
  language: "zh" | "en" | "bilingual"
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

// ------------------ 软装拆解 ------------------

export interface FurnitureBreakdownConfig {
  background: "white" | "gray" | "beige"
  language: "zh" | "en" | "bilingual"
  layout: "scattered" | "grid"
}

function buildFurnitureBreakdownPrompt(config: FurnitureBreakdownConfig): string {
  const bgMap: Record<string, string> = {
    white: "白色",
    gray: "浅灰",
    beige: "米色",
  }

  const langMap: Record<string, string> = {
    zh: "中文",
    en: "英文",
    bilingual: "中英双语",
  }

  const layoutMap: Record<string, string> = {
    scattered: "错落有致",
    grid: "网格对齐",
  }

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

// ------------------ 主入口 ------------------

export function buildPrompt(scene: string, config: Record<string, any>): string {
  switch (scene) {
    case "render":
      return buildRenderPrompt(config as RenderConfig)
    case "floorplan":
      return buildFloorplanPrompt(config as FloorplanConfig)
    case "color-analysis":
      return buildColorAnalysisPrompt(config as ColorAnalysisConfig)
    case "furniture-breakdown":
      return buildFurnitureBreakdownPrompt(config as FurnitureBreakdownConfig)
    default:
      return config.customPrompt || ""
  }
}

// 导出场景列表（前端用）
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
    id: "color-analysis",
    title: "颜色搭配分析",
    description: "智能解析空间配色方案",
    icon: "Pipette",
    color: "#9B59B6",
  },
  {
    id: "furniture-breakdown",
    title: "软装拆解",
    description: "一键提取所有家具单品",
    icon: "LayoutGrid",
    color: "#27AE60",
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
