<!--  -->
<template>

  <section class="member-section">
    <el-card class="member-card">
      <h1>會員管理</h1>

      <!-- 如果要用兩種註冊方式再考慮使用這個 -->
      <div class="function-bar">
        <div class="display-count">
          <div class="total-count">總數量為： {{ memberCount }} 人</div>
          <div>當前查詢數量為： {{ memberList.total }} 人</div>
        </div>

        <div class="btn-box">

          <el-button type="primary" @click="toggleAddDialog">
            新增<el-icon class="el-icon--right">
              <Plus />
            </el-icon>
          </el-button>

          <el-button type="danger" @click="deleteList" :disabled="deleteSelectList.length > 0 ? false : true">
            刪除<el-icon class="el-icon--right">
              <Delete />
            </el-icon>
          </el-button>

          <el-button type="success" @click="downloadExcel">下載Excel</el-button>
        </div>
      </div>

      <div class="search-bar">
        <el-input v-model="input" style="width: 240px" placeholder="輸入內容,Enter查詢"
          @input="getMemberByPagination(currentPage, 10)" />


      </div>

      <el-table class="member-table" :data="memberList.records" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" />


        <el-table-column prop="chineseName" label="姓名" width="100"></el-table-column>
        <el-table-column prop="email" label="信箱" />
        <el-table-column prop="phone" label="手機號碼" width="150" />




        <el-table-column prop="tagSet" label="標籤" min-width="40" align="center">
          <template #default="scope">
            <el-popover v-if="scope.row.tagSet.length > 0" placement="left-start" title="標籤" :width="200"
              trigger="hover">
              <template #reference>
                <el-tag v-if="findFirstVaildTag(scope.row.tagSet)" size="large" round
                  :color="findFirstVaildTag(scope.row.tagSet).color" effect="light">{{
                    findFirstVaildTag(scope.row.tagSet).name }}</el-tag>
              </template>
              <template #default>
                <div v-for="tag in scope.row.tagSet" :key="tag.tagId" class="tag-item">
                  <el-tag v-if="tag.status === 0" size="large" round :color="tag.color">{{
                    tag.name }}</el-tag>
                </div>
              </template>
            </el-popover>

          </template>
        </el-table-column>


        <el-table-column fixed="right" label="操作" width="150">
          <!-- 透過#default="scope" , 獲取到當前的對象值 , scope.row則是拿到當前那個row的數據  -->
          <template #default="scope">
            <el-button link type="success" size="small" @click="toggleTagsDialog(scope.row)">
              Tags
            </el-button>
            <el-button link type="primary" size="small" @click="editRow(scope.row)">
              Edit
            </el-button>
            <el-button link type="danger" size="small" @click="deleteRow(scope.row.memberId)">
              Delete</el-button>

          </template>
        </el-table-column>
      </el-table>


      <!-- 
      分頁插件 total為總資料數(這邊設置20筆),  default-page-size代表每頁顯示資料(預設為10筆,這邊設置為5筆) 
      current-page當前頁數,官方建議使用v-model與current-page去與自己設定的變量做綁定,
    -->
      <div class="example-pagination-block member-pagination">
        <el-pagination layout="prev, pager, next" :page-count="Number(memberList.pages)"
          :default-page-size="Number(memberList.size)" v-model:current-page="currentPage" :hide-on-single-page="true" />
      </div>

      <el-dialog v-model="tagsDialogIsOpen" title="編輯標籤">
        <h1>{{ assignMember.name }}</h1>
        <div class="transfer-box">
          <el-transfer v-model="assignMember.tagList" :data="transferDataList" :titles="['未擁有', '已擁有']">
            <template #default="{ option }">
              <el-tag :color="option.color" size="large" round>{{ option.label }}</el-tag>
            </template>
            <template #left-empty>
              <el-empty :image-size="60" description="No data" />
            </template>
            <template #right-empty>
              <el-empty :image-size="60" description="No data" />
            </template>
          </el-transfer>
        </div>
        <template #footer>
          <el-button>取消</el-button>
          <el-button type="primary" @click="submitTagsList">保存</el-button>
        </template>
      </el-dialog>



      <!-- 修改時的Drawer -->
      <el-drawer v-model="drawer" title="I am the title">

        <template #header>
          <h4>資料修改</h4>
        </template>

        <template #default>
          <el-form label-position="top" label-width="auto" :model="updateMemberForm" ref="updateMemberFormRef">

            <el-form-item label="姓名" prop="chineseName" :rules="formRulesTW.chineseName">
              <el-input v-model="updateMemberForm.chineseName" placeholder="請輸入密碼" />
            </el-form-item>

            <el-form-item label="電子信箱" prop="email" :rules="formRulesTW.email">
              <el-input disabled v-model="updateMemberForm.email" />
            </el-form-item>

            <el-form-item label="連絡電話" prop="phone" :rules="formRulesTW.phone">
              <el-input v-model="updateMemberForm.phone" />
            </el-form-item>

            <el-form-item v-if="backStageMember.includes(updateMemberForm.category) || updateMemberForm.category === 8"
              label="國籍" prop="country" :rules="formRulesTW.country">
              <el-select v-model="updateMemberForm.country" placeholder="國籍">
                <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
              </el-select>
            </el-form-item>

            <div v-if="updateMemberForm.category !== 8">
              <el-form-item label="身分證" prop="idCard" :rules="formRulesTW.idCard">
                <el-input v-model="updateMemberForm.idCard" />
              </el-form-item>
            </div>


            <el-form-item label="所屬科部" prop="affiliation" :rules="formRulesTW.affiliation">
              <el-input v-model="updateMemberForm.affiliation">
              </el-input>
            </el-form-item>

            <el-form-item label="職稱" prop="jobTitle" :rules="formRulesTW.jobTitle">
              <el-input v-model="updateMemberForm.jobTitle" />
            </el-form-item>

            <el-form-item label="醫院" prop="receipt" :rules="formRulesTW.receipt">
              <el-input v-model="updateMemberForm.receipt" />
            </el-form-item>


            <div class="extra-form-item-box" v-if="backStageMember.includes(updateMemberForm.category)">
              <el-form-item class="" label="住宿" prop="food" :rules="formRulesTW.food">
                <el-input v-model="updateMemberForm.food" placeholder="請輸入住宿需求" />
              </el-form-item>
              <el-form-item class="" label="晚宴" prop="foodTaboo" :rules="formRulesTW.foodTaboo">
                <el-input v-model="updateMemberForm.foodTaboo" placeholder="請輸入晚宴需求" />
              </el-form-item>
              <el-form-item class="" label="攜眷" prop="remitAccountLast5" :rules="formRulesTW.remitAccountLast5">
                <el-input v-model="updateMemberForm.remitAccountLast5" placeholder="是否攜眷" />
              </el-form-item>

            </div>
            <!-- <el-form-item label="飲食偏好" prop="dietaryPreference">
              <el-radio-group v-model="updateMemberForm.food" placeholder="Select" style="width: 240px;">
                <el-radio label="葷食" value="葷">
                </el-radio>
                <el-radio label="素食" value="素">
                </el-radio>
              </el-radio-group>
            </el-form-item> -->

            <!-- <el-form-item label="飲食禁忌" prop="foodTaboo">
              <el-input v-model="updateMemberForm.foodTaboo" placeholder="請輸入飲食禁忌" />
            </el-form-item> -->


          </el-form>
        </template>


        <template #footer>
          <div style="flex: auto">
            <el-button @click="cancelClick">取消</el-button>
            <el-button type="primary" @click="confirmClick()">送出</el-button>
          </div>
        </template>

      </el-drawer>
    </el-card>
    <!-- Insert Form -->
    <el-dialog class="insert-dialog" v-model="dialogFormVisible" width="500">
      <el-form class="insert-form" ref="form" :model="insertForm" label-position="top">
        <el-form-item class="insert-name" label="姓名" prop="chineseName" :rules="formRulesTW.chineseName">
          <el-input v-model="insertForm.chineseName" placeholder="請輸入姓名" />
        </el-form-item>
        <el-form-item class="" label="電子信箱" prop="email" :rules="formRulesTW.email">
          <el-input v-model="insertForm.email" type="email" placeholder="請輸入E-mail" />
        </el-form-item>
        <div class="phone-num-box">
          <!-- <el-form-item class="" label="電話號碼" prop="countryCode" :rules="formRulesTW.countryCode">
            <el-input class="country-code-input" v-model="insertForm.countryCode" disabled placeholder="國家代碼" />
          </el-form-item> -->
          <el-form-item class="" label="電話號碼" prop="phone" :rules="formRulesTW.phone">
            <el-input class="phone-input" v-model="insertForm.phone" placeholder="電話號碼"></el-input>
          </el-form-item>
        </div>
        <el-form-item label="國籍" prop="country" :rules="formRulesTW.country">
          <el-select v-model="insertForm.country" placeholder="國籍">
            <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
          </el-select>
        </el-form-item>
        <el-form-item class="" label="所屬科部" prop="affiliation" :rules="formRulesTW.affiliation">
          <el-input v-model="insertForm.affiliation" placeholder="所屬科部" />
        </el-form-item>
        <el-form-item class="" label="職稱" prop="jobTitle" :rules="formRulesTW.jobTitle">
          <el-input v-model="insertForm.jobTitle" placeholder="職稱" />
        </el-form-item>
        <el-form-item class="" label="醫院" prop="receipt" :rules="formRulesTW.receipt">
          <el-input v-model="insertForm.receipt" placeholder="醫院" />
        </el-form-item>
        <!-- <el-form-item class="" label="身分證" prop="idCard" :rules="formRulesTW.idCard">
          <el-input v-model="insertForm.idCard" placeholder="身分證" />
        </el-form-item> -->
        <el-form-item class="" label="住宿" prop="food" :rules="formRulesTW.food">
          <el-input v-model="insertForm.food" placeholder="請輸入住宿需求" />
        </el-form-item>
        <el-form-item class="" label="晚宴" prop="foodTaboo" :rules="formRulesTW.foodTaboo">
          <el-input v-model="insertForm.foodTaboo" placeholder="請輸入晚宴需求" />
        </el-form-item>
        <el-form-item class="" label="攜眷" prop="remitAccountLast5" :rules="formRulesTW.remitAccountLast5">
          <el-input v-model="insertForm.remitAccountLast5" placeholder="是否攜眷" />
        </el-form-item>

        <el-form-item class="" label="身分" prop="category" :rules="formRulesTW.category">
          <el-radio-group v-model="insertForm.category">
            <el-radio label="MVP" value="4">MVP</el-radio>
            <el-radio label="講者" value="5">講者</el-radio>
            <el-radio label="座長" value="6">座長</el-radio>
            <el-radio label="Staff" value="7">Staff</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div style="flex: auto">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="submitInsertForm(form)">送出</el-button>
        </div>
      </template>
    </el-dialog>

  </section>

</template>

<script setup lang='ts'>

import { ref, reactive } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'
import type { FormInstance } from 'element-plus'
import { getMemberByPaginationByStatusApi, getMemberCountApi, updateMemberApi, deleteMemberApi, batchDeleteMemberApi, downloadMemberExcelApi, assignTagsToMember, addMemberByAdminApi } from '@/api/member'
import { getAllTagsApi } from '@/api/tag'

import type { memberRecordType } from '@/api/member/type.ts'
import type { returnType } from '@/api/type'

import countriesJson from '@/assets/data/countries.json'

import { formRulesTW } from '@/utils/checkSum'


const countries = ref(countriesJson)

/**================================================== */
const downloadExcel = async () => {
  try {
    let res = await downloadMemberExcelApi()
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '會員列表.xlsx');
    document.body.appendChild(link);
    link.click();
  } catch (error) {
    ElMessage.error("下載失敗" + error)
  }
}
/**================================================== */

//查詢內容
let input = ref('')

//篩選審核狀態,預設找已經過審的
let filterStatus = ref('')

//獲取同意書總數
let memberCount = ref<number>(0)



/**--------------顯示數據相關---------------------------- */


const getMemberCount = async () => {
  try {
    let res = await getMemberCountApi()
    memberCount.value = res.data
  } catch (err) {
    console.log(err)
    ElMessage.error("獲取會員數量失敗")
  }
}



let memberList = reactive<Record<string, memberRecordType[]>>({
  records: [{
    memberId: "",
    email: "",
    chineseName: "",
    firstName: "",
    lastName: "",
    country: "",
    idCard: "",
    group: "",
    food: "",
    title: "",
    receipt: "",
    category: 0,
    categoryExtra: "",
    foodTaboo: "",
    groupRole: "",
    remitAccountLast5: "",
    affiliation: "",
    jobTitle: "",
    phone: "",
    status: "",
    tagSet: [],
  }]
})

//設定分頁組件,currentPage當前頁數
let currentPage = ref<number>(1)



const getMemberByPagination = async (page: number, size: number): Promise<void> => {
  try {
    let res = await getMemberByPaginationByStatusApi(page, size, filterStatus.value, input.value)
    Object.assign(memberList, res.data)
  } catch (err) {
    console.log(err)
    ElMessage.error("獲取會員資料失敗")
  }
}


//監聽當前頁數的變化,如果有更動就call API 獲取數組數據
watch(currentPage, (value, oldValue) => {
  getMemberByPagination(value, 10)
})


watch(filterStatus, (value, oldValue) => {
  getMemberByPagination(currentPage.value, 10)
})

/** --------- 刪除相關variable及function -------------- */

//要刪除的對象列表
let deleteSelectList = reactive([])

//當checkbox狀態改變時的function,val是一個數組對象
const handleSelectionChange = (val: any) => {
  //重製deleteSelectList,移除所有屬性
  deleteSelectList.length = 0
  Object.assign(deleteSelectList, val)
}

//刪除同意書
const deleteRow = (id: number): void => {
  ElMessageBox.confirm(`確定要刪除此資料嗎？`, '確認刪除', {
    confirmButtonText: '確定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 用户選擇確認，繼續操作
    await deleteMemberApi(id)
    getMemberByPagination(currentPage.value, 10)

    ElMessage.success('刪除成功');
  }).catch((err) => {
    console.log(err)
  });
}

//批量刪除同意書的function
const deleteList = () => {
  if (deleteSelectList.length >= 1) {
    ElMessageBox.confirm(`確定要刪除這${deleteSelectList.length}個會員資料嗎？`, '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(async () => {
      //確定刪除後使用父組件傳來的function
      //提取idList
      console.log(deleteSelectList)
      let deleteIdList = deleteSelectList.map((item: { memberId: string }) => item.memberId)
      await batchDeleteMemberApi(deleteIdList)
      getMemberByPagination(currentPage.value, 10)
      ElMessage.success('刪除成功');
    }).catch((err) => {
      console.log(err)
    })

  } else {
    ElMessage.error("請至少勾選一筆資料進行刪除")
  }
}

/**-------------表單相關variable及function------------------------- */


/**------------編輯內容相關操作---------------------- */

//drawer的開關
const drawer = ref(false)

//drawer內,取消按鈕
const cancelClick = () => {
  drawer.value = false
}

const backStageMember = [4, 5, 6, 7];

//編輯的表單元素本身

const updateMemberFormRef = ref()

let updateMemberForm = reactive<memberRecordType>({
  memberId: "",
  group: "",
  title: "",
  receipt: "",
  category: 0,
  categoryExtra: "",
  groupRole: "",
  email: "",
  chineseName: "",
  firstName: "",
  lastName: "",
  country: "",
  remitAccountLast5: "",
  affiliation: "",
  jobTitle: "",
  phone: "",
  status: "",
  food: "",
  foodTaboo: "",
  idCard: "",
  tagSet: [],
})




//drawer內,確認按鈕
const confirmClick = async () => {
  //沒有抓到的這個Dom直接返回
  updateMemberFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      console.log(updateMemberForm)
      await updateMemberApi(updateMemberForm)
      drawer.value = false
      ElMessage.success("修改完成")
      await getMemberByPagination(currentPage.value, 10)


    } else {
      ElMessage.error("請完整填入資訊")
    }
  })

}

const editRow = (member: any): void => {
  Object.assign(updateMemberForm, member)
  console.log(updateMemberForm.category)
  console.log(updateMemberForm.category === 8)
  drawer.value = true
}

/**-------------------標籤-------------------- */
let tagsDialogIsOpen = ref(false);
let assignMember = reactive<any>({});

let tagsList = reactive<any>([]);

let transferDataList = reactive<any>([]);

const getTagsList = async () => {
  let res = await getAllTagsApi()
  Object.assign(tagsList, res.data);
  res.data.forEach((item: any) => {
    transferDataList.push({
      label: item.name,
      key: item.tagId,
      disabled: item.status === 1,
      color: item.color
    })
  })
}

const findFirstVaildTag = (tagSet: any) => {
  for (let i = 0; i < tagSet.length; i++) {
    if (tagSet[i].status === 0) {
      return tagSet[i];
    }
  }
  return '';
}

const toggleTagsDialog = async (member: any) => {
  assignMember = member;
  assignMember.tagList = Array.from(member.tagSet).map((item: any) => item.tagId);
  tagsDialogIsOpen.value = true;
}

const submitTagsList = async () => {
  let data = {
    memberId: assignMember.memberId,
    targetTagIdList: assignMember.tagList
  }
  let res = await assignTagsToMember(data);
  getMemberByPagination(currentPage.value, 10);
  tagsDialogIsOpen.value = false;
}








/**======================Insert Form============================= */
const insertForm = reactive({
  chineseName: '',
  email: '',
  affiliation: '',
  jobTitle: '',
  receipt: '',
  idCard: '',
  countryCode: '886',
  phone: '',
  food: '',
  foodTaboo: '',
  category: '4',
  country: 'Taiwan',
  remitAccountLast5: '',
})
//是否顯示表單dialog
const dialogFormVisible = ref(false)

//表單實例
const form = ref()

//顯示新增Dialog
const toggleAddDialog = () => {
  dialogFormVisible.value = true
}

//送出表單方法
const submitInsertForm = (form: FormInstance | undefined) => {
  //沒有抓到的這個Dom直接返回
  if (!form) return
  form.validate(async (valid) => {
    if (valid) {
      try {
        //呼叫父組件給的新增function API
        await addMemberByAdminApi(insertForm)
        ElMessage.success('新增成功');
        getMemberByPagination(currentPage.value, 10)
        form.resetFields()

      } catch (err: any) {
        console.log(err)
      }
      //最終都將這個dialog關掉
      dialogFormVisible.value = false

    } else {
      ElMessage.error("請完整填入資訊")
    }
  })
}





/**-------------------掛載頁面時執行-------------------- */

onMounted(() => {
  getMemberByPagination(1, 10)
  getMemberCount()
  getTagsList()
})




</script>

<style scoped lang="scss">
.member-section {
  width: 95%;
  margin: 0 auto;

  .member-card {
    margin-top: 2%;
    margin-bottom: 2%;
  }

  h1 {
    text-align: center;
    font-size: 2rem;
    margin: 1% 0;
  }
}




.function-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1%;

  .total-count {
    font-weight: 600;
  }

}

.filter-status {
  margin-left: 10px;
}


.member-table {
  width: 100%;
  height: auto;
}


.member-pagination {
  margin-top: 1%;
  margin-bottom: 1%;
}

.gender-other {
  width: 100px;
  margin-left: 1rem;
}

.transfer-box {
  display: flex;
  justify-content: center;
}

.tag-item {
  display: flex;
}

/**
  使用Vue3 element plus 專屬的改變UI組件CSS 寫法 '深層覆蓋'
  分頁組件引入盒子,重置分頁組件CSS */
:deep(.el-pagination) {

  justify-content: center;

  //重製將分頁組件背景色調為 '無'
  .el-pager li {
    background: none !important;
  }

  //按鈕背景色改成 '無'
  button {
    background: none !important;
  }

  &+& {
    margin-top: 10px;
  }

  .example-demonstration {
    margin-bottom: 16px;
  }

}

:deep(.el-tag__content) {
  color: white;
  font-size: 14px;
}

:deep(.el-tag__close) {
  color: red;
}
</style>
