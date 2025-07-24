<template>
  <div class="layout-container">
    <!-- 标题 -->
    <h2>文字颜色格式化工具</h2>
    
    <!-- 响应式两列布局 -->
    <el-row :gutter="20">
      <!-- 左列：输入和预览 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-space direction="vertical" fill style="width: 100%;">
          <!-- 文字输入 -->
          <el-card>
            <template #header>文字输入</template>
            <el-input
              v-model="inputText"
              type="textarea"
              :autosize="{ minRows: 4, maxRows: 8 }"
              placeholder="请输入要格式化的文字..."
              @input="handleTextInput"
            />
          </el-card>

          <!-- 文字预览 -->
          <el-card>
            <template #header>文字预览（点击字符选择，按住拖拽批量选择）</template>
            <div style="border: 1px dashed var(--el-border-color); padding: 15px; min-height: 60px; max-height: 300px; overflow-y: auto; word-wrap: break-word; word-break: break-all; line-height: 1.6; border-radius: var(--el-border-radius-base); user-select: none;">
              <span
                v-for="(char, index) in textCharacters"
                :key="index"
                :style="{ 
                  color: char.color,
                  backgroundColor: char.selected ? 'var(--sider-hover-color)' : 'transparent',
                  padding: '2px 4px',
                  cursor: char.isIcon ? 'default' : 'pointer',
                  borderRadius: 'var(--el-border-radius-small)',
                  display: 'inline-block',
                  opacity: char.opacity !== undefined ? char.opacity : (char.isIcon ? '0.8' : '1')
                }"
                @mousedown="handleMouseDown(index)"
                @mouseenter="handleMouseEnter(index)"
                @mouseup="handleMouseUp"
                @click="toggleCharacterSelection(index)"
              >{{ getDisplayChar(char.char) }}</span>
            </div>
          </el-card>

          <!-- 输出结果 -->
          <el-card>
            <template #header>格式化结果</template>
            <el-space direction="vertical" fill style="width: 100%;">
              <!-- 可视化输出 -->
              <div style="width: 100%;">
                <el-text type="primary">预览效果：</el-text>
                <div style="border: 1px solid var(--el-border-color); padding: 15px; min-height: 60px; max-height: 300px; overflow-y: auto; margin-top: 8px; word-wrap: break-word; word-break: break-all; line-height: 1.6; border-radius: var(--el-border-radius-base); width: 100%; box-sizing: border-box;">
                  <span
                    v-for="segment in outputSegments"
                    :key="segment.id"
                    :style="{ color: segment.color }"
                  >{{ getDisplayText(segment.text) }}</span>
                </div>
              </div>

              <!-- 代码输出 -->
              <div style="width: 100%;">
                <el-text type="primary">格式化代码：</el-text>
                <el-input
                  v-model="formattedOutput"
                  type="textarea"
                  readonly
                  :autosize="{ minRows: 3, maxRows: 6 }"
                  placeholder="格式化后的代码将在这里显示..."
                  style="margin-top: 8px; width: 100%;"
                />
              </div>

              <!-- 操作按钮 -->
              <el-space>
                <el-button @click="copyToClipboard" type="primary">
                  <el-icon><DocumentCopy /></el-icon>
                  复制代码
                </el-button>
                <el-button @click="downloadAsText" type="success" plain>
                  <el-icon><Download /></el-icon>
                  下载文本
                </el-button>
              </el-space>
            </el-space>
          </el-card>
        </el-space>
      </el-col>

      <!-- 右列：颜色选择和图标 -->
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-space direction="vertical" fill style="width: 100%;">
          <!-- 颜色选择 -->
          <el-card>
            <template #header>颜色选择</template>
            <el-space direction="vertical" fill>
              <!-- 基准色开关和控制 -->
              <div>
                <el-checkbox v-model="useBaseColor" @change="handleBaseColorToggle">
                  使用基准颜色
                </el-checkbox>
                
                <div v-if="useBaseColor" style="margin-top: 8px;">
                  <div>
                    <el-text type="primary">基准颜色：</el-text>
                    <div style="margin-top: 4px;">
                      <el-color-picker v-model="baseColor" @change="handleBaseColorChange" />
                      <el-text type="info" style="margin-left: 8px;">{{ baseColor }}</el-text>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 预设颜色 -->
              <div>
                <el-text type="primary">预设颜色：</el-text>
                <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px;">
                  <el-tooltip
                    v-for="color in presetColors"
                    :key="color.name"
                    :content="color.name"
                    placement="top"
                  >
                    <div
                      :style="{ 
                        backgroundColor: color.hex,
                        width: '32px',
                        height: '32px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        border: '1px solid #dcdfe6'
                      }"
                      @click="applyColor(color.hex)"
                    ></div>
                  </el-tooltip>
                </div>
              </div>

              <!-- 自定义颜色 -->
              <div>
                <el-text type="primary">自定义颜色：</el-text>
                <div style="margin-top: 8px;">
                  <el-color-picker
                    v-model="customColor"
                    @change="applyColor(customColor)"
                  />
                  <el-text type="info" style="margin-left: 8px;">{{ customColor }}</el-text>
                </div>
              </div>

              <!-- 随机颜色控制 -->
              <div>
                <el-text type="primary">随机颜色：</el-text>
                <div style="margin-top: 8px;">
                  <el-space>
                    <el-checkbox v-model="randomOpacity">
                      随机透明度
                    </el-checkbox>
                    <el-button @click="randomColors" type="warning" size="small">
                      随机颜色
                    </el-button>
                  </el-space>
                </div>
              </div>

              <!-- 操作按钮 -->
              <el-space>
                <el-button @click="clearSelection" type="info" plain>清除选择</el-button>
                <el-button @click="resetColors" type="warning" plain>重置颜色</el-button>
              </el-space>
            </el-space>
          </el-card>

          <!-- 图标选择 -->
          <el-card>
            <template #header>图标插入</template>
            <el-tabs v-model="activeIconTab" @tab-click="handleIconTabClick">
              <el-tab-pane
                v-for="(icons, category) in iconCategories"
                :key="category"
                :label="category"
                :name="category"
              >
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; max-height: 300px; overflow-y: auto;">
                  <el-tooltip
                    v-for="icon in icons"
                    :key="icon.name"
                    :content="icon.name"
                    placement="top"
                  >
                    <el-button
                      @click="insertIcon(icon.code)"
                      size="small"
                      style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
                    >
                      {{ icon.name }}
                    </el-button>
                  </el-tooltip>
                </div>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </el-space>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, Download } from '@element-plus/icons-vue'

interface Character {
  char: string
  selected: boolean
  color: string
  opacity?: number
  isIcon?: boolean
}

interface OutputSegment {
  id: number
  text: string
  color: string
}

interface Icon {
  name: string
  code: string
}

// 响应式数据
const inputText = ref('')
const textCharacters = ref<Character[]>([])
const customColor = ref('#FF0000')
const baseColor = ref('#FFFFFF')
const activeIconTab = ref('常用表情')
const useBaseColor = ref(true)
const randomOpacity = ref(false)
const isSelecting = ref(false)
const startSelectIndex = ref(-1)
const isDragging = ref(false)

// 预设颜色
const presetColors = [
  { name: '红色', hex: '#FF0000' },
  { name: '绿色', hex: '#32CD32' },
  { name: '蓝色', hex: '#0000FF' },
  { name: '黄色', hex: '#FFD700' },
  { name: '紫色', hex: '#800080' },
  { name: '橙色', hex: '#FFA500' },
  { name: '粉色', hex: '#FF69B4' },
  { name: '青色', hex: '#00FFFF' },
  { name: '白色', hex: '#FFFFFF' },
  { name: '黑色', hex: '#000000' }
]

// 图标分类（基于守望先锋生成器）
const iconCategories: Record<string, Icon[]> = {
  '常用表情': [
    { name: '爱心 ❤️', code: '<tx0C00000000017112>' },
    { name: '点赞 👍', code: '<tx0C00000000005A0D>' },
    { name: '招手 👋', code: '<tx0C00000000005A0B>' },
    { name: '难过 😔', code: '<tx0C0000000002A9FE>' },
    { name: '警告 ⚠️', code: '<tx0C00000000005A0C>' },
    { name: '叉 ❌', code: '<tx0C0000000002A9F9>' }
  ],
  '英雄图标': [
    { name: '天使 👼', code: '<tx0C00000000038C39>' },
    { name: '安娜 🔫', code: '<tx0C00000000038C3C>' },
    { name: 'D.Va 🤖', code: '<tx0C00000000038C19>' },
    { name: '铁拳 👊', code: '<tx0C00000000038C1A>' },
    { name: '女王 👑', code: '<tx0C00000000038C1B>' },
    { name: '奥丽莎 🏰', code: '<tx0C00000000038C1C>' },
    { name: '莱因哈特 🛡️', code: '<tx0C00000000038C1E>' },
    { name: '路霸 🐷', code: '<tx0C00000000038C1F>' },
    { name: '温斯顿 🦍', code: '<tx0C00000000038C25>' },
    { name: '破坏球 ⚽', code: '<tx0C00000000038C26>' },
    { name: '西格玛 🌀', code: '<tx0C00000000038C27>' },
    { name: '查莉娅 💪', code: '<tx0C00000000038C28>' },
    { name: '艾什 🤠', code: '<tx0C00000000038C29>' },
    { name: '堡垒 🏯', code: '<tx0C00000000038C2A>' },
    { name: '麦克雷 🔫', code: '<tx0C00000000038C2B>' },
    { name: '回声 📡', code: '<tx0C0000000003849D>' },
    { name: '源氏 🗾', code: '<tx0C00000000038C2C>' },
    { name: '半藏 🏹', code: '<tx0C00000000038C2D>' },
    { name: '狂鼠 💣', code: '<tx0C00000000038C2E>' },
    { name: '美 🇰🇷', code: '<tx0C00000000038C2F>' },
    { name: '法拉 🚀', code: '<tx0C00000000038C30>' },
    { name: '死神 💀', code: '<tx0C00000000038C31>' },
    { name: '索杰恩 ⚡', code: '<tx0C00000000038C33>' },
    { name: '士兵76 🎖️', code: '<tx0C00000000038C34>' },
    { name: '黑影 👻', code: '<tx0C00000000038C35>' },
    { name: '对称 🔷', code: '<tx0C00000000038C36>' },
    { name: '托比昂 🔨', code: '<tx0C00000000038C37>' },
    { name: '黑百合 🕷️', code: '<tx0C00000000038C38>' },
    { name: '莫伊拉 🧬', code: '<tx0C00000000038C3A>' },
    { name: '禅雅塔 🧘', code: '<tx0C00000000038C3B>' },
    { name: '闪光 ⚡', code: '<tx0C00000000038C3D>' },
    { name: '巴蒂 🦇', code: '<tx0C00000000038C3E>' },
    { name: '布丽吉塔 🔧', code: '<tx0C00000000038C3F>' },
    { name: '雾子 🌸', code: '<tx0C00000000038C40>' },
    { name: '卢西奥 🎵', code: '<tx0C00000000038C41>' }
  ],
  '杂项图标': [
    { name: '消灭(骷髅) 💀', code: '<tx0C000000000015BB>' },
    { name: '麦克风 🎤', code: '<tx0C00000000007114>' },
    { name: '金牌 🥇', code: '<tx0C0000000000797E>' },
    { name: '银牌 🥈', code: '<tx0C0000000000797C>' },
    { name: '铜牌 🥉', code: '<tx0C0000000000797D>' },
    { name: '游戏货币 💰', code: '<tx0C00000000008E02>' },
    { name: '工坊图标 🔧', code: '<tx0C0000000001FEE9>' },
    { name: '准备就绪 ✅', code: '<tx0C000000000039DB>' },
    { name: '500强(紫) 💜', code: '<tx0C000000000190E0>' },
    { name: '500强(橙) 🧡', code: '<tx0C00000000009A2E>' },
    { name: '500强(白) 🤍', code: '<tx0C0000000000A541>' },
    { name: '点赞(绿) 💚', code: '<tx0C0000000001764D>' },
    { name: '体育精神(青) 💙', code: '<tx0C0000000001764F>' },
    { name: '指挥(紫) 💜', code: '<tx0C0000000001764E>' },
    { name: '竞技点 ⭐', code: '<tx0C0000000000906E>' }
  ],
  '地图图标': [
    { name: '阿努比斯 🏛️', code: '<tx0C00000000005D1D>' },
    { name: '监测站 🏔️', code: '<tx0C00000000005D1E>' },
    { name: '好莱坞 🎬', code: '<tx0C00000000005D1F>' },
    { name: '花村 🌸', code: '<tx0C00000000005D20>' },
    { name: '国王大道 👑', code: '<tx0C00000000005D21>' },
    { name: '多拉多 🏺', code: '<tx0C00000000005D22>' },
    { name: '沃斯卡娅 🏭', code: '<tx0C00000000005D24>' },
    { name: '漓江塔 🏮', code: '<tx0C00000000005D28>' },
    { name: '伊利奥斯 🏛️', code: '<tx0C00000000005D29>' },
    { name: '尼泊尔 🏔️', code: '<tx0C00000000005D2A>' },
    { name: '艾兴瓦尔德 🏰', code: '<tx0C0000000000A214>' },
    { name: '绿洲城 🏜️', code: '<tx0C0000000000BF72>' },
    { name: '渣客镇 🤖', code: '<tx0C0000000000F302>' },
    { name: '暴雪世界 ❄️', code: '<tx0C00000000012B71>' },
    { name: '里阿尔托 🏛️', code: '<tx0C00000000013EC2>' },
    { name: '釜山 🇰🇷', code: '<tx0C00000000017629>' },
    { name: '巴黎 🇫🇷', code: '<tx0C000000000191C5>' },
    { name: '哈瓦那 🇨🇺', code: '<tx0C0000000001ED2B>' }
  ]
}

// 处理文字输入
const handleTextInput = () => {
  const text = inputText.value
  const characters: Character[] = []
  
  let i = 0
  while (i < text.length) {
    // 检查是否是图标代码
    if (text[i] === '<' && text.indexOf('>', i) !== -1) {
      const endIndex = text.indexOf('>', i)
      const iconCode = text.substring(i, endIndex + 1)
      
      // 图标代码作为不可选择的整体添加
      characters.push({
        char: iconCode,
        selected: false,
        color: baseColor.value,
        isIcon: true
      })
      
      i = endIndex + 1
    } else {
      // 普通字符
      characters.push({
        char: text[i],
        selected: false,
        color: baseColor.value,
        isIcon: false
      })
      
      i++
    }
  }
  
  textCharacters.value = characters
}

// 切换字符选择状态
const toggleCharacterSelection = (index: number) => {
  const char = textCharacters.value[index]
  // 图标不可选择
  if (char.isIcon) {
    return
  }
  
  // 如果刚刚发生了拖拽，不执行单击选择
  if (isDragging.value) {
    return
  }
  
  char.selected = !char.selected
}

// 批量选择功能
const handleMouseDown = (index: number) => {
  if (textCharacters.value[index].isIcon) return
  isSelecting.value = true
  startSelectIndex.value = index
  isDragging.value = false
}

const handleMouseEnter = (index: number) => {
  if (!isSelecting.value || textCharacters.value[index].isIcon) return
  
  // 如果鼠标移动到不同的字符上，表示开始拖拽
  if (index !== startSelectIndex.value) {
    isDragging.value = true
    
    const start = Math.min(startSelectIndex.value, index)
    const end = Math.max(startSelectIndex.value, index)
    
    // 清除当前选择
    textCharacters.value.forEach(char => {
      if (!char.isIcon) char.selected = false
    })
    
    // 批量选择范围内的字符
    for (let i = start; i <= end; i++) {
      if (!textCharacters.value[i].isIcon) {
        textCharacters.value[i].selected = true
      }
    }
  }
}

const handleMouseUp = () => {
  isSelecting.value = false
  startSelectIndex.value = -1
  // 延迟重置拖拽状态，让 click 事件能检测到
  setTimeout(() => {
    isDragging.value = false
  }, 10)
}

// 随机颜色功能
const randomColors = () => {
  textCharacters.value.forEach(char => {
    if (char.isIcon) return
    
    // 生成随机颜色
    const randomColor = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
    char.color = randomColor
    
    // 随机透明度（如果开启）
    if (randomOpacity.value) {
      char.opacity = Math.random() * 0.8 + 0.2 // 0.2-1.0 的透明度
    } else {
      char.opacity = 1
    }
  })
}

// 应用颜色到选中的字符
const applyColor = (color: string) => {
  const selectedCount = textCharacters.value.filter(char => char.selected && !char.isIcon).length
  if (selectedCount === 0) {
    ElMessage.warning('请先选择要设置颜色的字符')
    return
  }
  
  textCharacters.value.forEach(char => {
    if (char.selected && !char.isIcon) {
      char.color = color
      char.selected = false // 应用颜色后取消选择
    }
  })
  
  ElMessage.success(`已为 ${selectedCount} 个字符设置颜色`)
}

// 清除所有选择
const clearSelection = () => {
  textCharacters.value.forEach(char => {
    char.selected = false
  })
  ElMessage.info('已清除所有选择')
}

// 重置所有颜色
const resetColors = () => {
  textCharacters.value.forEach(char => {
    if (!char.isIcon) {
      char.color = baseColor.value
      char.opacity = 1
    }
    char.selected = false
  })
  ElMessage.success('已重置所有颜色')
}

// 基准色开关处理
const handleBaseColorToggle = () => {
  if (!useBaseColor.value) {
    // 关闭基准色时，不再使用基准色逻辑
    ElMessage.info('已关闭基准颜色功能')
  } else {
    // 开启基准色时，将所有字符重置为基准色
    textCharacters.value.forEach(char => {
      if (!char.isIcon) {
        char.color = baseColor.value
        char.opacity = 1
      }
    })
    ElMessage.info('已开启基准颜色功能')
  }
}

// 基准颜色变化处理
const handleBaseColorChange = () => {
  if (useBaseColor.value) {
    // 更新所有字符颜色为基准色（仅在开启基准色时）
    textCharacters.value.forEach(char => {
      if (!char.isIcon) {
        char.color = baseColor.value
      }
    })
  }
}

// 监听基准颜色变化，更新所有基准颜色的字符（仅在开启基准色时）
watch(baseColor, (newBaseColor, oldBaseColor) => {
  if (useBaseColor.value) {
    textCharacters.value.forEach(char => {
      if (!char.isIcon && char.color === oldBaseColor) {
        char.color = newBaseColor
      }
    })
  }
})

// 插入图标
const insertIcon = (iconCode: string) => {
  inputText.value += iconCode
  handleTextInput()
  ElMessage.success('图标已插入')
}

// 处理图标标签页点击
const handleIconTabClick = (tab: any) => {
  activeIconTab.value = tab.paneName
}

// 创建图标代码到emoji的映射
const iconCodeToEmoji: Record<string, string> = {}
Object.values(iconCategories).forEach(categoryIcons => {
  categoryIcons.forEach(icon => {
    // 提取emoji部分（最后一个空格后的内容）
    const emojiMatch = icon.name.match(/([^\s]+)$/)
    if (emojiMatch) {
      iconCodeToEmoji[icon.code] = emojiMatch[1]
    }
  })
})

// 获取字符显示内容（用于预览区域）
const getDisplayChar = (char: string): string => {
  if (char.startsWith('<tx') && char.endsWith('>')) {
    return iconCodeToEmoji[char] || char
  }
  return char
}

// 获取文本显示内容（用于输出区域）
const getDisplayText = (text: string): string => {
  let result = text
  Object.keys(iconCodeToEmoji).forEach(code => {
    result = result.replace(new RegExp(code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), iconCodeToEmoji[code])
  })
  return result
}

// 将HEX颜色转换为RGBA格式
const hexToRgba = (hex: string): string => {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const a = 255 // 完全不透明
  return `${r.toString(16).padStart(2, '0').toUpperCase()}${g.toString(16).padStart(2, '0').toUpperCase()}${b.toString(16).padStart(2, '0').toUpperCase()}${a.toString(16).padStart(2, '0').toUpperCase()}`
}

// 计算输出片段
const outputSegments = computed<OutputSegment[]>(() => {
  if (textCharacters.value.length === 0) return []
  
  const segments: OutputSegment[] = []
  let currentSegment = ''
  let currentColor = textCharacters.value[0]?.color || baseColor.value
  let segmentId = 0

  textCharacters.value.forEach((char, index) => {
    if (char.color !== currentColor) {
      // 颜色改变时，保存当前片段
      if (currentSegment) {
        segments.push({
          id: segmentId++,
          text: currentSegment,
          color: currentColor
        })
      }
      // 开始新片段
      currentSegment = char.char
      currentColor = char.color
    } else {
      // 相同颜色，追加字符
      currentSegment += char.char
    }
  })

  // 保存最后一个片段
  if (currentSegment) {
    segments.push({
      id: segmentId++,
      text: currentSegment,
      color: currentColor
    })
  }

  return segments
})

// 计算格式化输出
const formattedOutput = computed(() => {
  let result = ''
  
  if (useBaseColor.value) {
    // 开启基准色时的逻辑：有基准色和结束色标签
    const baseRgbaHex = hexToRgba(baseColor.value)
    result += `<FG${baseRgbaHex}>`
    
    outputSegments.value.forEach((segment, index) => {
      const isLastSegment = index === outputSegments.value.length - 1
      const nextSegment = outputSegments.value[index + 1]
      
      if (segment.color === baseColor.value) {
        // 基准颜色文字直接输出
        result += segment.text
      } else {
        // 有颜色的文字需要标签
        const rgbaHex = hexToRgba(segment.color)
        result += `<FG${rgbaHex}>${segment.text}`
        
        // 在颜色段落结束后添加基准颜色标签
        if (isLastSegment || (nextSegment && nextSegment.color !== segment.color)) {
          result += `<FG${baseRgbaHex}>`
        }
      }
    })
  } else {
    // 关闭基准色时的逻辑：每个颜色独立，无基准色和结束色
    outputSegments.value.forEach((segment) => {
      const rgbaHex = hexToRgba(segment.color)
      result += `<FG${rgbaHex}>${segment.text}`
    })
  }
  
  return result
})

// 复制到剪贴板
const copyToClipboard = async () => {
  if (!formattedOutput.value) {
    ElMessage.warning('没有内容可复制')
    return
  }
  
  try {
    await navigator.clipboard.writeText(formattedOutput.value)
    ElMessage.success('代码已复制到剪贴板！')
  } catch (err) {
    console.error('复制失败:', err)
    // 降级方案
    const textArea = document.createElement('textarea')
    textArea.value = formattedOutput.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success('代码已复制到剪贴板！')
  }
}

// 下载为文本文件
const downloadAsText = () => {
  if (!formattedOutput.value) {
    ElMessage.warning('没有内容可下载')
    return
  }
  
  const blob = new Blob([formattedOutput.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `formatted_text_${new Date().toISOString().slice(0, 10)}.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('文件下载成功！')
}

// 初始化
handleTextInput()
</script>

<style scoped>
/* 保持最小样式，使用 Element Plus 默认样式 */
.layout-container {
    overflow-x: hidden !important;
    overflow-y: auto !important;
    /* padding: 20px; */
}
</style>
