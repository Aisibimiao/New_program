"use strict";
const common_vendor = require("../../common/vendor.js");
const api_goods = require("../../api/goods.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "edit",
  setup(__props) {
    const userStore = stores_user.useUserStore();
    const goodsId = common_vendor.ref("");
    const categories = [
      { value: "ELECTRONICS", label: "数码产品" },
      { value: "CLOTHING", label: "服饰鞋包" },
      { value: "BOOK", label: "图书教材" },
      { value: "SPORTS", label: "运动户外" },
      { value: "LIFE", label: "生活用品" },
      { value: "OTHER", label: "其他" }
    ];
    const categoryOptions = categories.map((c) => c.label);
    const collegeOptions = [
      "信息工程学院",
      "计算机学院",
      "电子学院",
      "软件学院",
      "机械学院",
      "电气学院",
      "经管学院",
      "外语学院",
      "其他学院"
    ];
    const majorOptions = [
      "计算机科学与技术",
      "软件工程",
      "电子信息工程",
      "通信工程",
      "机械工程",
      "电气工程",
      "会计学",
      "市场营销",
      "其他专业"
    ];
    const gradeOptions = ["2023", "2024", "2025", "2026"];
    const semesterOptions = ["上", "下"];
    const images = common_vendor.ref([]);
    const form = common_vendor.ref({
      name: "",
      description: "",
      category: "",
      originalPrice: "",
      price: "",
      college: "",
      major: "",
      bookName: "",
      grade: "",
      semester: ""
    });
    const selectedCategoryLabel = common_vendor.computed(() => {
      const cat = categories.find((c) => c.value === form.value.category);
      return cat ? cat.label : "";
    });
    const canSubmit = common_vendor.computed(() => {
      return images.value.length > 0 && form.value.name && form.value.description && form.value.price && form.value.category;
    });
    function getImageUrl(url) {
      if (!url || url === "[]") return "";
      if (url.startsWith("http")) return url;
      if (url.startsWith("/")) return `http://localhost:3000${url}`;
      return url;
    }
    async function loadGoodsDetail() {
      try {
        const result = await api_goods.getGoodsDetail(goodsId.value);
        form.value = {
          name: result.name,
          description: result.description,
          category: result.category,
          originalPrice: result.originalPrice ? String(result.originalPrice) : "",
          price: String(result.price),
          college: result.college || "",
          major: result.major || "",
          bookName: result.bookName || "",
          grade: result.grade || ""
        };
        images.value = result.images || [];
      } catch (err) {
        console.error("加载商品详情失败", err);
        common_vendor.index.showToast({ title: "加载失败", icon: "none" });
      }
    }
    function onCategoryChange(e) {
      const index = e.detail.value;
      form.value.category = categories[index].value;
      if (form.value.category !== "BOOK") {
        form.value.college = "";
        form.value.major = "";
        form.value.bookName = "";
        form.value.grade = "";
        form.value.originalPrice = "";
      }
    }
    function onCollegeChange(e) {
      form.value.college = collegeOptions[e.detail.value];
    }
    function onMajorChange(e) {
      form.value.major = majorOptions[e.detail.value];
    }
    function onGradeChange(e) {
      form.value.grade = gradeOptions[e.detail.value];
    }
    function onSemesterChange(e) {
      form.value.semester = semesterOptions[e.detail.value];
    }
    async function chooseImage() {
      common_vendor.index.chooseImage({
        count: 6 - images.value.length,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: async (res) => {
          common_vendor.index.showLoading({ title: "上传中..." });
          try {
            for (const filePath of res.tempFilePaths) {
              const url = await api_goods.uploadImage(filePath);
              images.value.push(url);
            }
          } catch (err) {
            common_vendor.index.showToast({ title: "上传失败", icon: "none" });
            console.error("上传失败", err);
          } finally {
            common_vendor.index.hideLoading();
          }
        }
      });
    }
    function removeImage(index) {
      images.value.splice(index, 1);
    }
    async function handleSubmit() {
      if (!canSubmit.value) {
        common_vendor.index.showToast({ title: "请填写完整信息", icon: "none" });
        return;
      }
      common_vendor.index.showLoading({ title: "保存中..." });
      try {
        await api_goods.updateGoods(goodsId.value, {
          name: form.value.name,
          description: form.value.description,
          category: form.value.category,
          originalPrice: form.value.originalPrice,
          price: form.value.price,
          images: images.value,
          college: form.value.college,
          major: form.value.major,
          bookName: form.value.bookName,
          grade: form.value.grade
        });
        common_vendor.index.showToast({ title: "修改成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (err) {
        common_vendor.index.showToast({ title: err.message || "修改失败", icon: "none" });
        console.error("修改失败", err);
      } finally {
        common_vendor.index.hideLoading();
      }
    }
    function goBack() {
      common_vendor.index.navigateBack();
    }
    common_vendor.onMounted(() => {
      userStore.initFromStorage();
      const pages = getCurrentPages();
      const currentPage = pages[pages.length - 1];
      const options = currentPage.options;
      goodsId.value = options.id || "";
      if (!goodsId.value) {
        common_vendor.index.showToast({ title: "参数错误", icon: "none" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
        return;
      }
      loadGoodsDetail();
    });
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(selectedCategoryLabel.value || "请选择分类"),
        b: common_vendor.unref(categoryOptions),
        c: common_vendor.o(onCategoryChange),
        d: form.value.category === "BOOK"
      }, form.value.category === "BOOK" ? {
        e: common_vendor.t(form.value.college || "请选择学院"),
        f: collegeOptions,
        g: common_vendor.o(onCollegeChange),
        h: common_vendor.t(form.value.major || "请选择专业"),
        i: majorOptions,
        j: common_vendor.o(onMajorChange),
        k: common_vendor.t(form.value.grade || "请选择年级"),
        l: gradeOptions,
        m: common_vendor.o(onGradeChange),
        n: common_vendor.t(form.value.semester || "请选择学期"),
        o: semesterOptions,
        p: common_vendor.o(onSemesterChange),
        q: form.value.bookName,
        r: common_vendor.o(($event) => form.value.bookName = $event.detail.value)
      } : {}, {
        s: form.value.name,
        t: common_vendor.o(($event) => form.value.name = $event.detail.value),
        v: form.value.description,
        w: common_vendor.o(($event) => form.value.description = $event.detail.value),
        x: common_vendor.t(form.value.description.length),
        y: common_vendor.f(images.value, (img, index, i0) => {
          return {
            a: getImageUrl(img),
            b: common_vendor.o(($event) => removeImage(index), index),
            c: index
          };
        }),
        z: images.value.length < 6
      }, images.value.length < 6 ? {
        A: common_vendor.o(chooseImage)
      } : {}, {
        B: form.value.category === "BOOK"
      }, form.value.category === "BOOK" ? {
        C: form.value.originalPrice,
        D: common_vendor.o(($event) => form.value.originalPrice = $event.detail.value)
      } : {}, {
        E: form.value.price,
        F: common_vendor.o(($event) => form.value.price = $event.detail.value),
        G: common_vendor.o(goBack),
        H: !canSubmit.value ? 1 : "",
        I: common_vendor.o(handleSubmit)
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-b23a23c5"]]);
wx.createPage(MiniProgramPage);
