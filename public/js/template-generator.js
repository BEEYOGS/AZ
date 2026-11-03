(() => {
  "use strict";
  if (window.__templateJpegAppInitialized) return;
  window.__templateJpegAppInitialized = true;
"use strict";

    const excelInput = document.getElementById("excel-file");
    const templateInput = document.getElementById("template-file");
    const columnSelect = document.getElementById("column-select");
    const columnField = document.getElementById("column-field");
    const generateButton = document.getElementById("generate-button");
    const status = document.getElementById("status");
    const preview = document.getElementById("preview");
    const outputSize = document.getElementById("output-size");
    const orientation = document.getElementById("orientation");
    const sizeDescription = document.getElementById("size-description");
    const customSize = document.getElementById("custom-size");
    const customWidth = document.getElementById("custom-width");
    const customHeight = document.getElementById("custom-height");
    const manualModeButton = document.getElementById("manual-mode-button");
    const excelModeButton = document.getElementById("excel-mode-button");
    const manualPanel = document.getElementById("manual-panel");
    const excelPanel = document.getElementById("excel-panel");
    const sequenceStart = document.getElementById("sequence-start");
    const sequenceCount = document.getElementById("sequence-count");
    const sequencePreview = document.getElementById("sequence-preview");
    const findFontsButton = document.getElementById("find-fonts-button");
    const themeToggle = document.getElementById("theme-toggle");
    const horizontalOffset = document.getElementById("horizontal-offset");
    const verticalOffset = document.getElementById("vertical-offset");
    const rotation = document.getElementById("rotation");
    const contentType = document.getElementById("content-type");
    const positionCount = document.getElementById("position-count");
    const activePosition = document.getElementById("active-position");
    const columnLabel = document.getElementById("column-label");
    const alignment = document.getElementById("alignment");
    const fontFamily = document.getElementById("font-family");
    const textSize = document.getElementById("text-size");
    const customTextSize = document.getElementById("custom-text-size");
    const customTextSizeField = document.getElementById("custom-text-size-field");
    const textWeight = document.getElementById("text-weight");
    const textCase = document.getElementById("text-case");
    const textItalic = document.getElementById("text-italic");
    const textUnderline = document.getElementById("text-underline");
    const textStrike = document.getElementById("text-strike");
    const textColor = document.getElementById("text-color");
    const textOutlineEnabled = document.getElementById("text-outline-enabled");
    const textOutlineOptions = document.getElementById("text-outline-options");
    const textOutlineColor = document.getElementById("text-outline-color");
    const textOutlineColorValue = document.getElementById("text-outline-color-value");
    const textOutlineWidth = document.getElementById("text-outline-width");
    const barcodeHeight = document.getElementById("barcode-height");
    const barcodeHeightSetting = document.getElementById("barcode-height-setting");
    const customBarcodeHeight = document.getElementById("custom-barcode-height");
    const customBarcodeHeightField = document.getElementById("custom-barcode-height-field");
    const canvas = document.createElement("canvas");
    const OUTPUT_DPI = 300;
    let rows = [];
    let headers = [];
    let dataMode = "manual";
    let templateImage = null;
    let templateRect = { x: 0, y: 0, width: 0, height: 0 };
    let positions = [{ x: 0.1955, y: 0.5921 }, { x: 0.643, y: 0.62 }];
    const makeDefaultOverlaySettings = () => ({
      columnIndex: 0,
      type: "text",
      alignment: "center",
      fontFamily: "Bebas Neue",
      textSize: "36",
      customTextSize: "36",
      textWeight: "900",
      textCase: "none",
      textItalic: false,
      textUnderline: false,
      textStrike: false,
      textColor: "#ffffff",
      textOutlineEnabled: false,
      textOutlineColor: "#1a1d20",
      textOutlineWidth: "1.5",
      barcodeHeight: "12",
      customBarcodeHeight: "12",
      anchor: 4,
      horizontalOffset: "0",
      verticalOffset: "0",
      rotation: "0"
    });
    const overlaySettings = [makeDefaultOverlaySettings(), makeDefaultOverlaySettings()];
    let activeDrag = null;
    let previewRendering = false;
    let previewNeedsRefresh = false;

    function setTheme(theme, persist = true) {
      const isDark = theme === "dark";
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      themeToggle.setAttribute("aria-label", `Ganti ke tema ${isDark ? "terang" : "gelap"}`);
      themeToggle.innerHTML = isDark
        ? '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.2 15.3A8.3 8.3 0 0 1 8.7 3.8 8.4 8.4 0 1 0 20.2 15.3Z" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Mode terang</span>'
        : '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.7"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg><span>Mode gelap</span>';
      if (persist) {
        try {
          localStorage.setItem("template-jpeg-theme", isDark ? "dark" : "light");
        } catch {
          setStatus("Tema berhasil diganti, tetapi browser tidak mengizinkan menyimpan preferensi.", "error");
        }
      }
    }

    try {
      const savedTheme = localStorage.getItem("template-jpeg-theme");
      if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme, false);
      else setTheme("dark", false);
    } catch {
      setTheme("dark", false);
    }

    themeToggle.addEventListener("click", () => {
      setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
    });

    function setStatus(message, kind = "") {
      status.textContent = message;
      status.className = kind;
    }

    function getOutputDimensions() {
      const presetSizes = {
        ticket: [7.6, 3.9],
        a4: [21, 29.7],
        legal: [21.59, 35.56],
        letter: [21.59, 27.94],
        "id-card": [8.56, 5.398]
      };
      let [widthCm, heightCm] = outputSize.value === "custom"
        ? [Number(customWidth.value), Number(customHeight.value)]
        : presetSizes[outputSize.value];
      if (!Number.isFinite(widthCm) || !Number.isFinite(heightCm) || widthCm < 1 || heightCm < 1 || widthCm > 60 || heightCm > 60) {
        throw new Error("Lebar dan tinggi kertas harus antara 1 sampai 60 cm.");
      }
      if (orientation.value === "landscape" && heightCm > widthCm) [widthCm, heightCm] = [heightCm, widthCm];
      if (orientation.value === "portrait" && widthCm > heightCm) [widthCm, heightCm] = [heightCm, widthCm];
      const width = Math.round(widthCm / 2.54 * OUTPUT_DPI);
      const height = Math.round(heightCm / 2.54 * OUTPUT_DPI);
      if (width > 8000 || height > 8000 || width * height > 32_000_000) {
        throw new Error("Ukuran gambar terlalu besar. Pilih ukuran maksimal 60 cm dengan total hingga 32 megapiksel.");
      }
      return { width, height, widthCm, heightCm };
    }

    function updateSizeDescription() {
      customSize.hidden = outputSize.value !== "custom";
      try {
        const { width, height, widthCm, heightCm } = getOutputDimensions();
        sizeDescription.textContent = `${widthCm.toLocaleString("id-ID")} × ${heightCm.toLocaleString("id-ID")} cm · ${width} × ${height} piksel · 300 PPI`;
      } catch (error) {
        sizeDescription.textContent = error.message;
      }
    }

    function resetPositionsForSize() {
      if (outputSize.value === "ticket") {
        positions = [{ x: 0.1955, y: 0.5921 }, { x: 0.643, y: 0.62 }];
      } else {
        positions = [{ x: 0.5, y: 0.5 }, { x: 0.68, y: 0.5 }];
      }
    }

    function getAnchorFactors(settings) {
      const anchor = Math.max(0, Math.min(8, Number(settings.anchor) || 0));
      return { x: anchor % 3 / 2, y: Math.floor(anchor / 3) / 2 };
    }

    function getPosition(index, width, height) {
      const settings = overlaySettings[index];
      return {
        x: positions[index].x * width + Number(settings.horizontalOffset || 0) / 25.4 * OUTPUT_DPI,
        y: positions[index].y * height + Number(settings.verticalOffset || 0) / 25.4 * OUTPUT_DPI
      };
    }

    function updatePlacementControls() {
      const settings = overlaySettings[Number(activePosition.value)];
      document.querySelectorAll(".anchor-picker button").forEach((button) => {
        const selected = Number(button.dataset.anchor) === Number(settings.anchor);
        button.setAttribute("aria-checked", String(selected));
        button.tabIndex = selected ? 0 : -1;
      });
      horizontalOffset.value = settings.horizontalOffset;
      verticalOffset.value = settings.verticalOffset;
      rotation.value = settings.rotation;
    }

    function updateSizeControls() {
      customTextSizeField.hidden = textSize.value !== "custom";
      customBarcodeHeightField.hidden = barcodeHeight.value !== "custom";
    }

    function validateDesignSettings() {
      const { widthCm, heightCm } = getOutputDimensions();
      if (outputSize.value === "custom" && (widthCm < 1 || widthCm > 60 || heightCm < 1 || heightCm > 60)) {
        throw new Error("Ukuran khusus harus antara 1 sampai 60 cm.");
      }

      for (let index = 0; index < Number(positionCount.value); index += 1) {
        const settings = overlaySettings[index];
        if (settings.type === "text" && settings.textSize === "custom") {
          const value = Number(settings.customTextSize);
          if (!Number.isFinite(value) || value < 1 || value > 300) {
            throw new Error(`Ukuran tulisan manual Posisi ${index + 1} harus antara 1 sampai 300 pt.`);
          }
        }
        if (settings.type === "text" && settings.textOutlineEnabled) {
          const value = Number(settings.textOutlineWidth);
          if (!Number.isFinite(value) || value < 0.1 || value > 12) {
            throw new Error(`Ketebalan outline Posisi ${index + 1} harus antara 0,1 sampai 12 pt.`);
          }
        }
        if (settings.type !== "text" && settings.barcodeHeight === "custom") {
          const value = Number(settings.customBarcodeHeight);
          if (!Number.isFinite(value) || value < 1 || value > 100) {
            throw new Error(`Tinggi barcode manual Posisi ${index + 1} harus antara 1 sampai 100 mm.`);
          }
        }
        for (const [label, value] of [["horizontal", settings.horizontalOffset], ["vertikal", settings.verticalOffset]]) {
          const offset = Number(value);
          if (!Number.isFinite(offset) || offset < -200 || offset > 200) {
            throw new Error(`Offset ${label} Posisi ${index + 1} harus antara -200 sampai 200 mm.`);
          }
        }
      }
    }

    function updatePositionControls() {
      const count = Number(positionCount.value);
      activePosition.querySelector('option[value="1"]').hidden = count === 1;
      if (count === 1) activePosition.value = "0";
      const positionIndex = Number(activePosition.value);
      columnLabel.textContent = `Kolom data untuk Posisi ${positionIndex + 1}`;
      if (!columnSelect.disabled) columnSelect.value = String(overlaySettings[positionIndex].columnIndex);
    }

    function getManualSequenceInfo() {
      const start = sequenceStart.value.trim();
      const match = /^(.*?)(\d+)$/.exec(start);
      if (!match) throw new Error("Nomor awal harus diakhiri angka, contohnya A0001.");
      const count = Number(sequenceCount.value);
      if (!Number.isInteger(count) || count < 1 || count > 5000) {
        throw new Error("Jumlah nomor harus bilangan bulat antara 1 sampai 5.000.");
      }

      const prefix = match[1];
      const digits = match[2];
      const lastNumber = BigInt(digits) + BigInt(count - 1);
      const lastValue = `${prefix}${String(lastNumber).padStart(digits.length, "0")}`;
      return { prefix, digits, count, lastValue };
    }

    function getManualEntries() {
      const { prefix, digits, count } = getManualSequenceInfo();
      const positionTotal = Number(positionCount.value);
      return Array.from({ length: count }, (_, index) => {
        const value = `${prefix}${String(BigInt(digits) + BigInt(index)).padStart(digits.length, "0")}`;
        return Array(positionTotal).fill(value);
      });
    }

    function updateSequencePreview() {
      try {
        const { count, lastValue } = getManualSequenceInfo();
        sequencePreview.textContent = `${sequenceStart.value.trim()} → ${lastValue} · ${count.toLocaleString("id-ID")} JPEG`;
        sequencePreview.classList.remove("invalid");
      } catch (error) {
        sequencePreview.textContent = error.message;
        sequencePreview.classList.add("invalid");
      }
    }

    function getSelectedValues() {
      if (dataMode === "manual") return getManualEntries();
      if (columnSelect.disabled) return [];
      const count = Number(positionCount.value);
      return rows
        .map((row) => Array.from(
          { length: count },
          (_, index) => String(row[overlaySettings[index].columnIndex] ?? "").trim()
        ))
        .filter((values) => values.some((value) => value.length > 0));
    }

    function updateButton() {
      let hasData = false;
      if (dataMode === "manual") {
        try {
          getManualSequenceInfo();
          hasData = true;
        } catch {
          hasData = false;
        }
      } else {
        hasData = rows.length > 0 && Boolean(columnSelect.value);
      }
      generateButton.disabled = !hasData || !templateImage;
    }

    function measureSpacedText(context, text, letterSpacing) {
      const characters = Array.from(text);
      const glyphWidths = characters.map((character) => context.measureText(character).width);
      const width = glyphWidths.reduce((total, glyphWidth) => total + glyphWidth, 0)
        + Math.max(0, characters.length - 1) * letterSpacing;
      return { characters, glyphWidths, width };
    }

    function getFontCss(settings) {
      const family = String(settings.fontFamily || "").trim() || "Bebas Neue";
      return `"${family.replace(/[\\"']/g, "")}"`;
    }

    function fitFontSize(context, text, maxWidth, maxHeight, settings) {
      const requestedSize = settings.textSize === "auto"
        ? maxHeight * 0.9
        : Number(settings.textSize === "custom" ? settings.customTextSize : settings.textSize) * OUTPUT_DPI / 72;
      let size = Math.min(requestedSize, maxHeight * 0.92);
      const trackingRatio = 0.055;
      const fontStyle = settings.textItalic ? "italic " : "";
      context.font = `${fontStyle}${settings.textWeight || "900"} ${size}px ${getFontCss(settings)}`;
      let measured = measureSpacedText(context, text, size * trackingRatio);
      for (let attempt = 0; measured.width > maxWidth && attempt < 5; attempt += 1) {
        size *= maxWidth / measured.width;
        context.font = `${fontStyle}${settings.textWeight || "900"} ${size}px ${getFontCss(settings)}`;
        measured = measureSpacedText(context, text, size * trackingRatio);
      }
      return { size, ...measured };
    }

    function drawText(context, text, position, area, settings) {
      const maxWidth = area.width * 0.9;
      const maxHeight = area.height * 0.3;
      const displayText = settings.textCase === "uppercase" ? text.toLocaleUpperCase("id-ID")
        : settings.textCase === "lowercase" ? text.toLocaleLowerCase("id-ID")
          : text;
      const { size, characters, glyphWidths, width } = fitFontSize(context, displayText, maxWidth, maxHeight, settings);
      const anchor = getAnchorFactors(settings);
      const areaX = -maxWidth * anchor.x;
      const areaY = -maxHeight * anchor.y;
      let cursorX = areaX;
      if (settings.alignment === "center") cursorX += (maxWidth - width) / 2;
      if (settings.alignment === "right") cursorX += maxWidth - width;

      context.save();
      context.translate(position.x, position.y);
      context.rotate(Number(settings.rotation) * Math.PI / 180);
      context.textAlign = "left";
      context.textBaseline = "middle";
      context.fillStyle = settings.textColor;
      context.lineJoin = "round";
      context.shadowColor = "#23120f99";
      context.shadowBlur = Math.max(2, context.canvas.width * 0.002);
      context.shadowOffsetY = Math.max(1, context.canvas.width * 0.001);
      characters.forEach((character, index) => {
        if (settings.textOutlineEnabled) {
          context.strokeStyle = settings.textOutlineColor || "#1a1d20";
          context.lineWidth = Math.max(1, Number(settings.textOutlineWidth || 1.5) * OUTPUT_DPI / 72);
          context.strokeText(character, cursorX, areaY + maxHeight / 2);
        }
        context.fillText(character, cursorX, areaY + maxHeight / 2);
        cursorX += glyphWidths[index] + (index < characters.length - 1 ? size * 0.055 : 0);
      });
      if (settings.textUnderline || settings.textStrike) {
        const decorationHeight = Math.max(1, size * 0.055);
        context.fillStyle = settings.textColor;
        if (settings.textUnderline) {
          context.fillRect(areaX + (settings.alignment === "center" ? (maxWidth - width) / 2 : settings.alignment === "right" ? maxWidth - width : 0), areaY + maxHeight / 2 + size * 0.38, width, decorationHeight);
        }
        if (settings.textStrike) {
          context.fillRect(areaX + (settings.alignment === "center" ? (maxWidth - width) / 2 : settings.alignment === "right" ? maxWidth - width : 0), areaY + maxHeight / 2 - decorationHeight / 2, width, decorationHeight);
        }
      }
      context.restore();
    }

    function loadSvgImage(svg) {
      return new Promise((resolve, reject) => {
        const source = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error("Barcode tidak dapat dirender."));
        image.src = source;
      });
    }

    async function drawBarcode(context, value, position, area, settings) {
      if (!window.JsBarcode) throw new Error("Pustaka barcode belum termuat. Muat ulang aplikasi.");
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      try {
        JsBarcode(svg, value, {
          format: settings.type,
          displayValue: true,
          font: "Arial",
          fontSize: Math.max(12, Math.round(OUTPUT_DPI * 0.11)),
          margin: 8,
          width: 2,
          height: Number(settings.barcodeHeight === "custom" ? settings.customBarcodeHeight : settings.barcodeHeight) / 25.4 * OUTPUT_DPI,
          lineColor: "#111111",
          background: "#ffffff"
        });
      } catch {
        const formatName = settings.type === "EAN13" ? "EAN-13" : "Code 128";
        const detail = settings.type === "EAN13"
          ? "EAN-13 memerlukan 12 atau 13 digit angka."
          : "Code 128 hanya bisa mencetak karakter yang didukung barcode.";
        throw new Error(`Nilai "${value}" tidak valid untuk ${formatName}. ${detail}`);
      }

      const image = await loadSvgImage(svg);
      const maxWidth = area.width * 0.9;
      const scale = Math.min(1, maxWidth / image.naturalWidth);
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      const anchor = getAnchorFactors(settings);
      let x = -maxWidth * anchor.x;
      if (settings.alignment === "center") x += (maxWidth - width) / 2;
      if (settings.alignment === "right") x += maxWidth - width;
      const y = -height * anchor.y;
      context.save();
      context.translate(position.x, position.y);
      context.rotate(Number(settings.rotation) * Math.PI / 180);
      context.drawImage(image, x, y, width, height);
      context.restore();
    }

    function drawTemplate(context, width, height) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
      templateRect = { x: 0, y: 0, width, height };
      if (!templateImage) return;
      const scale = Math.min(width / templateImage.naturalWidth, height / templateImage.naturalHeight);
      templateRect.width = templateImage.naturalWidth * scale;
      templateRect.height = templateImage.naturalHeight * scale;
      templateRect.x = (width - templateRect.width) / 2;
      templateRect.y = (height - templateRect.height) / 2;
      context.drawImage(templateImage, templateRect.x, templateRect.y, templateRect.width, templateRect.height);
    }

    async function drawArtwork(context, width, height, value) {
      if (overlaySettings.slice(0, Number(positionCount.value)).some((settings) => settings.fontFamily.toLocaleLowerCase("id-ID") === "bebas neue" && settings.type === "text")) {
        await document.fonts.load('900 80px "Bebas Neue"');
      }
      drawTemplate(context, width, height);
      if (!value.length) return;
      const count = Number(positionCount.value);
      for (let index = 0; index < count; index += 1) {
        if (!value[index]) continue;
        const position = getPosition(index, width, height);
        const settings = overlaySettings[index];
        if (settings.type === "text") drawText(context, value[index], position, templateRect, settings);
        else await drawBarcode(context, value[index], position, templateRect, settings);
      }
    }

    async function makeTicket(values) {
      const { width, height } = getOutputDimensions();
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d", { alpha: false });
      if (!context) throw new Error("Browser tidak dapat membuat gambar. Coba gunakan Chrome atau Edge versi terbaru.");
      await drawArtwork(context, width, height, values);

      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Gagal membuat JPEG. Pastikan gambar template adalah file gambar yang valid."));
            return;
          }
          setJpegDpi(blob, OUTPUT_DPI).then(resolve).catch(reject);
        }, "image/jpeg", 0.9);
      });
    }

    async function setJpegDpi(blob, dpi) {
      const bytes = new Uint8Array(await blob.arrayBuffer());
      if (bytes[0] !== 0xff || bytes[1] !== 0xd8) {
        throw new Error("Hasil gambar tidak memiliki format JPEG yang valid.");
      }

      let offset = 2;
      while (offset + 3 < bytes.length && bytes[offset] === 0xff) {
        const marker = bytes[offset + 1];
        if (marker === 0xda || marker === 0xd9) break;
        if (marker === 0x00 || marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd7)) {
          offset += 2;
          continue;
        }

        const segmentLength = (bytes[offset + 2] << 8) | bytes[offset + 3];
        const dataOffset = offset + 4;
        if (segmentLength < 2 || offset + 2 + segmentLength > bytes.length) break;

        const isJfif = marker === 0xe0
          && bytes[dataOffset] === 0x4a
          && bytes[dataOffset + 1] === 0x46
          && bytes[dataOffset + 2] === 0x49
          && bytes[dataOffset + 3] === 0x46
          && bytes[dataOffset + 4] === 0x00;
        if (isJfif) {
          if (dpi > 65535) throw new Error("Nilai resolusi JPEG di luar batas.");
          bytes[dataOffset + 7] = 1;
          bytes[dataOffset + 8] = (dpi >> 8) & 0xff;
          bytes[dataOffset + 9] = dpi & 0xff;
          bytes[dataOffset + 10] = (dpi >> 8) & 0xff;
          bytes[dataOffset + 11] = dpi & 0xff;
          return new Blob([bytes], { type: "image/jpeg" });
        }

        offset += 2 + segmentLength;
      }

      throw new Error("Metadata resolusi JPEG tidak ditemukan; coba gunakan Chrome atau Edge terbaru.");
    }

    function safeFilePart(value) {
      return value
        .normalize("NFKC")
        .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_")
        .replace(/[. ]+$/g, "")
        .slice(0, 100) || "tanpa-nomor";
    }

    function blobToDataUrl(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("Gagal membaca template gambar."));
        reader.readAsDataURL(blob);
      });
    }

    function drawPositionMarkers(context, width, height) {
      const count = Number(positionCount.value);
      const markerRadius = Math.max(12, Math.min(width, height) * 0.025);
      for (let index = 0; index < count; index += 1) {
        const point = getPosition(index, width, height);
        const selected = index === Number(activePosition.value);
        context.save();
        context.strokeStyle = selected ? "#ffb43b" : "#59d5ce";
        context.fillStyle = selected ? "#7d2018" : "#155d67";
        context.lineWidth = Math.max(3, width * 0.003);
        context.setLineDash(selected ? [] : [context.lineWidth * 2, context.lineWidth * 1.5]);
        context.beginPath();
        context.arc(point.x, point.y, markerRadius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
        context.setLineDash([]);
        context.beginPath();
        context.moveTo(point.x - markerRadius * 0.65, point.y);
        context.lineTo(point.x + markerRadius * 0.65, point.y);
        context.moveTo(point.x, point.y - markerRadius * 0.65);
        context.lineTo(point.x, point.y + markerRadius * 0.65);
        context.stroke();
        context.font = `700 ${markerRadius * 1.15}px "Segoe UI", Arial, sans-serif`;
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#fff";
        context.fillText(String(index + 1), point.x, point.y);
        context.restore();
      }
    }

    async function refreshPreview() {
      if (previewRendering) {
        previewNeedsRefresh = true;
        return;
      }
      previewRendering = true;
      try {
        do {
          previewNeedsRefresh = false;
          try {
            validateDesignSettings();
            const { width, height } = getOutputDimensions();
            preview.width = width;
            preview.height = height;
            const context = preview.getContext("2d", { alpha: false });
            if (!context) throw new Error("Browser tidak dapat menampilkan pratinjau.");
            let previewValues = [];
            try {
              previewValues = getSelectedValues()[0] || [];
            } catch {
              previewValues = [];
            }
            await drawArtwork(context, width, height, previewValues);
            drawPositionMarkers(context, width, height);
            preview.style.display = "block";
          } catch (error) {
            setStatus(`Pratinjau gagal: ${error.message}`, "error");
          }
        } while (previewNeedsRefresh);
      } finally {
        previewRendering = false;
      }
    }

    excelInput.addEventListener("change", async () => {
      rows = [];
      headers = [];
      columnSelect.replaceChildren();
      columnSelect.disabled = true;
      updateButton();

      const file = excelInput.files[0];
      if (!file) return;
      try {
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", raw: false });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        if (!firstSheet) throw new Error("Workbook tidak memiliki sheet yang bisa dibaca.");
        const table = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "", raw: false });
        if (table.length < 2) throw new Error("Excel harus memiliki satu baris judul dan minimal satu baris data.");
        headers = table[0].map((cell, index) => String(cell ?? "").trim() || `Kolom ${index + 1}`);
        rows = table.slice(1).filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""));
        if (!rows.length) throw new Error("Tidak ada baris data di sheet pertama.");

        headers.forEach((header, index) => {
          const option = document.createElement("option");
          option.value = String(index);
          option.textContent = header;
          columnSelect.append(option);
        });
        const preferredIndex = headers.findIndex((header) => header.toLocaleLowerCase("id-ID") === "nomor");
        const fallbackIndex = preferredIndex >= 0
          ? preferredIndex
          : headers.findIndex((header) => /^(kodekursi|kursi|seat)$/i.test(header));
        const selectedIndex = fallbackIndex >= 0 ? fallbackIndex : 0;
        overlaySettings.forEach((settings) => { settings.columnIndex = selectedIndex; });
        columnSelect.value = String(overlaySettings[Number(activePosition.value)].columnIndex);
        columnSelect.disabled = false;
        setStatus(`${rows.length} baris data ditemukan pada sheet "${workbook.SheetNames[0]}".`);
        updateButton();
        await refreshPreview();
      } catch (error) {
        rows = [];
        headers = [];
        columnSelect.replaceChildren();
        columnSelect.disabled = true;
        excelInput.value = "";
        updateButton();
        setStatus(`Excel tidak dapat dibaca: ${error.message}`, "error");
      }
    });

    templateInput.addEventListener("change", async () => {
      templateImage = null;
      const uploadLabel = document.querySelector(".upload-copy strong");
      if (uploadLabel) uploadLabel.textContent = templateInput.files[0]?.name || "Pilih gambar template";
      updateButton();
      const file = templateInput.files[0];
      if (!file) return;
      try {
        if (!file.type.startsWith("image/")) throw new Error("Pilih file template berupa gambar.");
        const image = new Image();
        image.src = await blobToDataUrl(file);
        await image.decode();
        templateImage = image;
        resetPositionsForSize();
        const rowSummary = rows.length ? `${rows.length} baris data; ` : "";
        setStatus(`${rowSummary}template siap (${image.naturalWidth} × ${image.naturalHeight} piksel).`);
        updateButton();
        await refreshPreview();
      } catch (error) {
        templateImage = null;
        templateInput.value = "";
        updateButton();
        setStatus(`Template tidak dapat dibaca: ${error.message}`, "error");
      }
    });

    function updateContentControls() {
      const settings = overlaySettings[Number(activePosition.value)];
      const isBarcode = settings.type !== "text";
      barcodeHeightSetting.hidden = !isBarcode;
      textSize.disabled = isBarcode;
      customTextSize.disabled = isBarcode;
      textWeight.disabled = isBarcode;
      textCase.disabled = isBarcode;
      textItalic.disabled = isBarcode;
      textUnderline.disabled = isBarcode;
      textStrike.disabled = isBarcode;
      textOutlineEnabled.disabled = isBarcode;
      textOutlineColor.disabled = isBarcode;
      textOutlineWidth.disabled = isBarcode;
      textOutlineOptions.hidden = isBarcode || !settings.textOutlineEnabled;
      textColor.disabled = isBarcode;
      fontFamily.disabled = isBarcode;
      findFontsButton.disabled = isBarcode;
      updateSizeControls();
      const sourceName = dataMode === "manual" ? "Nomor urut" : "Nilai dari kolom Excel";
      document.getElementById("content-hint").textContent = settings.type === "EAN13"
        ? `${sourceName} akan dirender sebagai EAN-13; formatnya harus angka.`
        : settings.type === "CODE128"
          ? `${sourceName} akan dirender sebagai Code 128; huruf dan angka didukung.`
          : `${sourceName} akan dicetak sebagai teks.`;
      preview.setAttribute(
        "aria-label",
        isBarcode
          ? "Pratinjau barcode; klik untuk mengatur posisinya"
          : "Pratinjau template; klik untuk mengatur posisi tulisan"
      );
    }

    function loadActivePositionSettings() {
      const settings = overlaySettings[Number(activePosition.value)];
      columnSelect.value = String(settings.columnIndex);
      contentType.value = settings.type;
      alignment.value = settings.alignment;
      fontFamily.value = settings.fontFamily;
      textSize.value = settings.textSize;
      customTextSize.value = settings.customTextSize;
      textWeight.value = settings.textWeight || "900";
      textCase.value = settings.textCase || "none";
      textItalic.checked = Boolean(settings.textItalic);
      textUnderline.checked = Boolean(settings.textUnderline);
      textStrike.checked = Boolean(settings.textStrike);
      textColor.value = settings.textColor;
      textOutlineEnabled.checked = Boolean(settings.textOutlineEnabled);
      textOutlineColor.value = settings.textOutlineColor || "#1a1d20";
      textOutlineColorValue.textContent = textOutlineColor.value.toUpperCase();
      textOutlineWidth.value = settings.textOutlineWidth || "1.5";
      barcodeHeight.value = settings.barcodeHeight;
      customBarcodeHeight.value = settings.customBarcodeHeight;
      columnLabel.textContent = `Kolom data untuk Posisi ${Number(activePosition.value) + 1}`;
      updatePlacementControls();
      updateContentControls();
    }

    function saveActivePositionSettings() {
      const settings = overlaySettings[Number(activePosition.value)];
      settings.columnIndex = Number(columnSelect.value);
      settings.type = contentType.value;
      settings.alignment = alignment.value;
      settings.fontFamily = fontFamily.value.trim() || "Bebas Neue";
      settings.textSize = textSize.value;
      settings.customTextSize = customTextSize.value;
      settings.textWeight = textWeight.value;
      settings.textCase = textCase.value;
      settings.textItalic = textItalic.checked;
      settings.textUnderline = textUnderline.checked;
      settings.textStrike = textStrike.checked;
      settings.textColor = textColor.value;
      settings.textOutlineEnabled = textOutlineEnabled.checked;
      settings.textOutlineColor = textOutlineColor.value;
      settings.textOutlineWidth = textOutlineWidth.value;
      settings.barcodeHeight = barcodeHeight.value;
      settings.customBarcodeHeight = customBarcodeHeight.value;
      updateContentControls();
    }

    function refreshAfterSettingsChange() {
      updateSizeDescription();
      updateButton();
      refreshPreview();
    }

    outputSize.addEventListener("change", () => {
      resetPositionsForSize();
      refreshAfterSettingsChange();
    });
    orientation.addEventListener("change", () => {
      resetPositionsForSize();
      refreshAfterSettingsChange();
    });
    [customWidth, customHeight].forEach((input) => input.addEventListener("input", refreshAfterSettingsChange));
    positionCount.addEventListener("change", () => {
      updatePositionControls();
      loadActivePositionSettings();
      refreshAfterSettingsChange();
    });
    contentType.addEventListener("change", () => {
      saveActivePositionSettings();
      refreshAfterSettingsChange();
    });
    [columnSelect, alignment, fontFamily, textSize, customTextSize, textWeight, textCase, barcodeHeight, customBarcodeHeight].forEach((control) => {
      control.addEventListener("change", () => {
        saveActivePositionSettings();
        refreshAfterSettingsChange();
      });
      if (control === customTextSize || control === customBarcodeHeight) {
        control.addEventListener("input", () => {
          saveActivePositionSettings();
          refreshAfterSettingsChange();
        });
      }
    });
    fontFamily.addEventListener("input", () => {
      saveActivePositionSettings();
      refreshAfterSettingsChange();
    });
    textColor.addEventListener("input", () => {
      saveActivePositionSettings();
      refreshAfterSettingsChange();
    });
    [textItalic, textUnderline, textStrike, textOutlineEnabled].forEach((control) => {
      control.addEventListener("change", () => {
        saveActivePositionSettings();
        refreshAfterSettingsChange();
      });
    });
    textOutlineColor.addEventListener("input", () => {
      textOutlineColorValue.textContent = textOutlineColor.value.toUpperCase();
      saveActivePositionSettings();
      refreshAfterSettingsChange();
    });
    textOutlineWidth.addEventListener("input", () => {
      saveActivePositionSettings();
      refreshAfterSettingsChange();
    });
    [horizontalOffset, verticalOffset, rotation].forEach((control) => {
      control.addEventListener("input", () => {
        const settings = overlaySettings[Number(activePosition.value)];
        settings.horizontalOffset = horizontalOffset.value;
        settings.verticalOffset = verticalOffset.value;
        settings.rotation = rotation.value;
        updateButton();
        refreshPreview();
      });
      control.addEventListener("change", () => {
        const settings = overlaySettings[Number(activePosition.value)];
        settings.horizontalOffset = horizontalOffset.value;
        settings.verticalOffset = verticalOffset.value;
        settings.rotation = rotation.value;
        refreshPreview();
      });
    });
    document.querySelectorAll(".anchor-picker button").forEach((button) => {
      button.addEventListener("click", () => {
        overlaySettings[Number(activePosition.value)].anchor = Number(button.dataset.anchor);
        updatePlacementControls();
        refreshPreview();
      });
    });
    document.querySelector(".anchor-picker").addEventListener("keydown", (event) => {
      const current = Number(overlaySettings[Number(activePosition.value)].anchor);
      const steps = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 };
      if (event.key === "Home") {
        event.preventDefault();
        overlaySettings[Number(activePosition.value)].anchor = 0;
      } else if (event.key === "End") {
        event.preventDefault();
        overlaySettings[Number(activePosition.value)].anchor = 8;
      } else if (Object.hasOwn(steps, event.key)) {
        const next = current + steps[event.key];
        if (next < 0 || next > 8 || (event.key === "ArrowLeft" && current % 3 === 0) || (event.key === "ArrowRight" && current % 3 === 2)) return;
        event.preventDefault();
        overlaySettings[Number(activePosition.value)].anchor = next;
      } else {
        return;
      }
      updatePlacementControls();
      const selectedAnchor = document.querySelector(`.anchor-picker [data-anchor="${overlaySettings[Number(activePosition.value)].anchor}"]`);
      selectedAnchor.focus();
      refreshPreview();
    });
    activePosition.addEventListener("change", () => {
      loadActivePositionSettings();
      setStatus(`Klik pratinjau untuk mengatur Posisi ${Number(activePosition.value) + 1}.`);
      refreshAfterSettingsChange();
    });

    function setDataMode(mode) {
      dataMode = mode;
      const isManual = mode === "manual";
      manualPanel.hidden = !isManual;
      excelPanel.hidden = isManual;
      columnField.hidden = isManual;
      manualModeButton.setAttribute("aria-pressed", String(isManual));
      excelModeButton.setAttribute("aria-pressed", String(!isManual));
      updateContentControls();
      updateButton();
      refreshPreview();
    }

    manualModeButton.addEventListener("click", () => setDataMode("manual"));
    excelModeButton.addEventListener("click", () => setDataMode("excel"));
    [sequenceStart, sequenceCount].forEach((input) => {
      input.addEventListener("input", () => {
        updateSequencePreview();
        updateButton();
        if (dataMode === "manual") refreshPreview();
      });
    });

    findFontsButton.addEventListener("click", async () => {
      if (typeof window.queryLocalFonts !== "function") {
        setStatus("Browser tidak mendukung pencarian font perangkat pada halaman file lokal. Ketik nama font di kolom Jenis font; pastikan font terpasang dan restart browser bila baru dipasang.", "error");
        return;
      }
      findFontsButton.disabled = true;
      try {
        const localFonts = await window.queryLocalFonts();
        const families = [...new Set(localFonts.map((font) => font.family))].sort((a, b) => a.localeCompare(b));
        const fontOptions = document.getElementById("font-options");
        const knownFamilies = new Set(Array.from(fontOptions.options, (option) => option.value));
        families.filter((family) => !knownFamilies.has(family)).forEach((family) => {
          const option = document.createElement("option");
          option.value = family;
          fontOptions.append(option);
        });
        if (families.length) {
          setStatus(`${families.length} font perangkat ditemukan. Pilih saran di kolom Jenis font.`, "success");
        } else {
          setStatus("Browser tidak mengembalikan daftar font perangkat. Ketik nama font di kolom Jenis font; pastikan font terpasang.", "error");
        }
      } catch (error) {
        setStatus(`Font perangkat tidak dapat diakses: ${error.message}. Anda tetap bisa mengetik nama font yang terpasang.`, "error");
      } finally {
        findFontsButton.disabled = false;
      }
    });

    function getPreviewPoint(event) {
      const bounds = preview.getBoundingClientRect();
      const displayScale = Math.min(bounds.width / preview.width, bounds.height / preview.height);
      const displayWidth = preview.width * displayScale;
      const displayHeight = preview.height * displayScale;
      const offsetX = (bounds.width - displayWidth) / 2;
      const offsetY = (bounds.height - displayHeight) / 2;
      const x = (event.clientX - bounds.left - offsetX) / displayWidth;
      const y = (event.clientY - bounds.top - offsetY) / displayHeight;
      if (x < 0 || x > 1 || y < 0 || y > 1) return null;
      return { x, y };
    }

    function setPositionFromPreviewPoint(index, point) {
      if (!point) return;
      const { width, height } = getOutputDimensions();
      const settings = overlaySettings[index];
      positions[index] = {
        x: point.x - Number(settings.horizontalOffset || 0) / 25.4 * OUTPUT_DPI / width,
        y: point.y - Number(settings.verticalOffset || 0) / 25.4 * OUTPUT_DPI / height
      };
      refreshPreview();
    }

    preview.addEventListener("pointerdown", (event) => {
      const point = getPreviewPoint(event);
      if (!point) return;
      const index = Number(activePosition.value);
      activeDrag = { pointerId: event.pointerId, index, startX: event.clientX, startY: event.clientY, moved: false };
      preview.classList.add("dragging");
      preview.setPointerCapture(event.pointerId);
      setPositionFromPreviewPoint(index, point);
      event.preventDefault();
    });
    preview.addEventListener("pointermove", (event) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      const distance = Math.hypot(event.clientX - activeDrag.startX, event.clientY - activeDrag.startY);
      if (distance > 2) activeDrag.moved = true;
      const point = getPreviewPoint(event);
      if (point) setPositionFromPreviewPoint(activeDrag.index, point);
    });
    preview.addEventListener("pointerup", (event) => {
      if (!activeDrag || activeDrag.pointerId !== event.pointerId) return;
      setStatus(`Posisi ${activeDrag.index + 1} ${activeDrag.moved ? "dipindahkan" : "diperbarui"}.`);
      activeDrag = null;
      preview.classList.remove("dragging");
    });
    preview.addEventListener("pointercancel", () => {
      activeDrag = null;
      preview.classList.remove("dragging");
    });

    function installCustomSelects() {
      const selectValueDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value");
      const selectDisabledDescriptor = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "disabled");
      if (!selectValueDescriptor?.get || !selectValueDescriptor.set || !selectDisabledDescriptor?.get || !selectDisabledDescriptor.set) {
        throw new Error("Browser tidak mendukung kontrol menu pilihan khusus.");
      }

      const closeMenus = () => {
        document.querySelectorAll(".custom-select-wrap.is-open").forEach((wrapper) => {
          wrapper.classList.remove("is-open");
          wrapper.querySelector(".custom-select-trigger").setAttribute("aria-expanded", "false");
          wrapper.querySelector(".custom-select-menu").hidden = true;
        });
      };

      document.querySelectorAll("select").forEach((select, selectIndex) => {
        const wrapper = document.createElement("div");
        wrapper.className = "custom-select-wrap";
        const trigger = document.createElement("button");
        trigger.className = "custom-select-trigger";
        trigger.type = "button";
        trigger.setAttribute("role", "combobox");
        trigger.setAttribute("aria-haspopup", "listbox");
        trigger.setAttribute("aria-expanded", "false");
        trigger.setAttribute("aria-controls", `${select.id}-options`);
        trigger.innerHTML = '<span class="custom-select-value"></span><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

        const menu = document.createElement("div");
        menu.className = "custom-select-menu";
        menu.id = `${select.id}-options`;
        menu.setAttribute("role", "listbox");
        menu.hidden = true;
        wrapper.append(trigger, menu);
        select.classList.add("custom-select-source");
        select.tabIndex = -1;
        select.setAttribute("aria-hidden", "true");
        select.insertAdjacentElement("afterend", wrapper);

        const labels = document.querySelectorAll(`label[for="${CSS.escape(select.id)}"]`);
        if (labels.length) {
          const label = labels[0];
          if (!label.id) label.id = `${select.id}-label`;
          trigger.setAttribute("aria-labelledby", label.id);
          label.addEventListener("click", (event) => {
            event.preventDefault();
            trigger.focus();
            if (!select.disabled) {
              closeMenus();
              wrapper.classList.add("is-open");
              trigger.setAttribute("aria-expanded", "true");
              menu.hidden = false;
              syncMenu();
            }
          });
        } else {
          trigger.setAttribute("aria-label", select.getAttribute("aria-label") || select.id);
        }

        let activeIndex = -1;
        let typeahead = "";
        let typeaheadTimeout = 0;

        function visibleOptions() {
          return Array.from(select.options).filter((option) => !option.hidden);
        }

        function syncMenu() {
          const options = visibleOptions();
          const selectedValue = selectValueDescriptor.get.call(select);
          const selectedIndex = options.findIndex((option) => option.value === selectedValue);
          const selected = options[selectedIndex];
          wrapper.querySelector(".custom-select-value").textContent = selected?.textContent?.trim() || "Pilih opsi";
          trigger.disabled = selectDisabledDescriptor.get.call(select);
          trigger.setAttribute("aria-disabled", String(trigger.disabled));
          if (activeIndex < 0 || activeIndex >= options.length || options[activeIndex]?.disabled || options[activeIndex]?.hidden) {
            activeIndex = selectedIndex;
          }
          menu.replaceChildren();
          options.forEach((option, optionIndex) => {
            const item = document.createElement("div");
            item.className = "custom-select-option";
            item.id = `${menu.id}-${optionIndex}`;
            item.setAttribute("role", "option");
            item.setAttribute("aria-selected", String(option.value === selectedValue));
            item.setAttribute("aria-disabled", String(option.disabled));
            item.textContent = option.textContent.trim();
            if (option.disabled) item.classList.add("is-disabled");
            if (option.value === selectedValue) item.classList.add("is-selected");
            if (optionIndex === activeIndex) item.classList.add("is-active");
            item.addEventListener("pointerenter", () => {
              activeIndex = optionIndex;
              menu.querySelectorAll(".custom-select-option").forEach((candidate, candidateIndex) => {
                candidate.classList.toggle("is-active", candidateIndex === activeIndex);
              });
              trigger.setAttribute("aria-activedescendant", item.id);
            });
            item.addEventListener("click", () => {
              if (option.disabled) return;
              selectValueDescriptor.set.call(select, option.value);
              syncMenu();
              closeMenus();
              select.dispatchEvent(new Event("input", { bubbles: true }));
              select.dispatchEvent(new Event("change", { bubbles: true }));
              trigger.focus();
            });
            menu.append(item);
          });
          if (wrapper.classList.contains("is-open") && activeIndex >= 0) {
            trigger.setAttribute("aria-activedescendant", `${menu.id}-${activeIndex}`);
            menu.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
          } else {
            trigger.removeAttribute("aria-activedescendant");
          }
        }

        function openMenu() {
          if (trigger.disabled) return;
          closeMenus();
          wrapper.classList.add("is-open");
          trigger.setAttribute("aria-expanded", "true");
          menu.hidden = false;
          syncMenu();
        }

        function moveActive(direction) {
          const options = visibleOptions();
          if (!wrapper.classList.contains("is-open")) {
            openMenu();
            if (direction > 0) activeIndex = Math.min(activeIndex + 1, options.length - 1);
            else activeIndex = Math.max(activeIndex - 1, 0);
          } else {
            let nextIndex = activeIndex + direction;
            while (nextIndex >= 0 && nextIndex < options.length && options[nextIndex].disabled) nextIndex += direction;
            if (nextIndex >= 0 && nextIndex < options.length) activeIndex = nextIndex;
          }
          syncMenu();
        }

        trigger.addEventListener("click", () => {
          if (wrapper.classList.contains("is-open")) closeMenus();
          else openMenu();
        });
        trigger.addEventListener("keydown", (event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            moveActive(event.key === "ArrowDown" ? 1 : -1);
          } else if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            const options = visibleOptions();
            activeIndex = event.key === "Home" ? 0 : options.length - 1;
            while (options[activeIndex]?.disabled && activeIndex >= 0 && activeIndex < options.length) {
              activeIndex += event.key === "Home" ? 1 : -1;
            }
            syncMenu();
          } else if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            if (!wrapper.classList.contains("is-open")) openMenu();
            else menu.querySelector(".is-active")?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
          } else if (event.key === "Escape" && wrapper.classList.contains("is-open")) {
            event.preventDefault();
            closeMenus();
          } else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            typeahead += event.key.toLocaleLowerCase("id-ID");
            window.clearTimeout(typeaheadTimeout);
            typeaheadTimeout = window.setTimeout(() => { typeahead = ""; }, 600);
            const matchIndex = visibleOptions().findIndex((option) => !option.disabled && option.textContent.trim().toLocaleLowerCase("id-ID").startsWith(typeahead));
            if (matchIndex >= 0) {
              activeIndex = matchIndex;
              if (wrapper.classList.contains("is-open")) syncMenu();
              else {
                selectValueDescriptor.set.call(select, visibleOptions()[matchIndex].value);
                syncMenu();
                select.dispatchEvent(new Event("input", { bubbles: true }));
                select.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
          } else if (event.key === "Tab") {
            closeMenus();
          }
        });

        Object.defineProperty(select, "value", {
          configurable: true,
          get() { return selectValueDescriptor.get.call(this); },
          set(value) {
            selectValueDescriptor.set.call(this, value);
            syncMenu();
          }
        });
        Object.defineProperty(select, "disabled", {
          configurable: true,
          get() { return selectDisabledDescriptor.get.call(this); },
          set(value) {
            selectDisabledDescriptor.set.call(this, value);
            syncMenu();
          }
        });
        select.addEventListener("change", syncMenu);
        new MutationObserver(syncMenu).observe(select, { childList: true, subtree: true, attributes: true });
        syncMenu();
      });

      document.addEventListener("pointerdown", (event) => {
        if (!event.target.closest(".custom-select-wrap")) closeMenus();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenus();
      });
    }

    function installCustomFontPicker() {
      const menu = document.getElementById("font-options-menu");
      const toggle = document.getElementById("font-picker-toggle");
      const datalist = document.getElementById("font-options");
      const combobox = fontFamily.closest(".font-combobox");
      const inputDisabledDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "disabled");
      if (!menu || !toggle || !datalist || !combobox) throw new Error("Menu font khusus tidak tersedia.");
      if (!inputDisabledDescriptor?.get || !inputDisabledDescriptor.set) throw new Error("Browser tidak mendukung status kontrol font.");

      let activeIndex = -1;

      function syncFontOptions(query = fontFamily.value) {
        const normalizedQuery = query.trim().toLocaleLowerCase("id-ID");
        const families = Array.from(datalist.options, (option) => option.value)
          .filter((family, index, list) => list.indexOf(family) === index)
          .filter((family) => !normalizedQuery || family.toLocaleLowerCase("id-ID").includes(normalizedQuery));
        menu.replaceChildren();
        activeIndex = families.length ? Math.max(0, families.findIndex((family) => family === fontFamily.value)) : -1;
        if (!families.length) {
          const empty = document.createElement("p");
          empty.className = "font-options-empty";
          empty.textContent = normalizedQuery ? "Tidak ada font yang cocok. Nama font tetap bisa diketik." : "Belum ada saran font.";
          menu.append(empty);
        }
        families.forEach((family, index) => {
          const option = document.createElement("button");
          option.type = "button";
          option.className = "font-option";
          option.id = `font-option-${index}`;
          option.setAttribute("role", "option");
          option.setAttribute("aria-selected", String(family === fontFamily.value));
          option.style.fontFamily = `"${family.replace(/[\\"']/g, "")}", sans-serif`;
          const familyLabel = document.createElement("span");
          familyLabel.textContent = family;
          const familySource = document.createElement("small");
          familySource.textContent = family === "Bebas Neue" ? "Disertakan" : "Font perangkat";
          option.append(familyLabel, familySource);
          option.addEventListener("pointerdown", (event) => event.preventDefault());
          option.addEventListener("click", () => {
            fontFamily.value = family;
            fontFamily.dispatchEvent(new Event("input", { bubbles: true }));
            fontFamily.dispatchEvent(new Event("change", { bubbles: true }));
            closeFontMenu();
            fontFamily.focus();
          });
          menu.append(option);
        });
        if (menu.hidden === false && activeIndex >= 0) {
          fontFamily.setAttribute("aria-activedescendant", `font-option-${activeIndex}`);
        } else {
          fontFamily.removeAttribute("aria-activedescendant");
        }
      }

      function openFontMenu() {
        if (fontFamily.disabled) return;
        syncFontOptions("");
        menu.hidden = false;
        fontFamily.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-expanded", "true");
      }

      function closeFontMenu() {
        menu.hidden = true;
        fontFamily.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-expanded", "false");
        fontFamily.removeAttribute("aria-activedescendant");
      }

      function moveFontActive(direction) {
        if (menu.hidden) {
          openFontMenu();
          return;
        }
        const options = menu.querySelectorAll(".font-option");
        if (!options.length) return;
        activeIndex = Math.max(0, Math.min(options.length - 1, activeIndex + direction));
        options.forEach((option, index) => option.classList.toggle("is-active", index === activeIndex));
        fontFamily.setAttribute("aria-activedescendant", `font-option-${activeIndex}`);
        options[activeIndex].scrollIntoView({ block: "nearest" });
      }

      Object.defineProperty(fontFamily, "disabled", {
        configurable: true,
        get() { return inputDisabledDescriptor.get.call(this); },
        set(value) {
          inputDisabledDescriptor.set.call(this, value);
          toggle.disabled = inputDisabledDescriptor.get.call(this);
          if (toggle.disabled) closeFontMenu();
        }
      });
      toggle.disabled = fontFamily.disabled;
      fontFamily.addEventListener("focus", openFontMenu);
      fontFamily.addEventListener("click", openFontMenu);
      fontFamily.addEventListener("input", () => {
        openFontMenu();
        syncFontOptions(fontFamily.value);
      });
      fontFamily.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          moveFontActive(event.key === "ArrowDown" ? 1 : -1);
        } else if (event.key === "Enter" && !menu.hidden && activeIndex >= 0) {
          event.preventDefault();
          menu.querySelectorAll(".font-option")[activeIndex]?.click();
        } else if (event.key === "Escape") {
          closeFontMenu();
        }
      });
      fontFamily.addEventListener("blur", () => window.setTimeout(() => {
        if (!combobox.contains(document.activeElement)) closeFontMenu();
      }, 0));
      toggle.addEventListener("click", () => {
        if (menu.hidden) {
          fontFamily.focus();
          openFontMenu();
        } else {
          closeFontMenu();
        }
      });
      document.addEventListener("pointerdown", (event) => {
        if (!combobox.contains(event.target) && event.target !== findFontsButton) closeFontMenu();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeFontMenu();
      });
      new MutationObserver(() => {
        if (!menu.hidden) syncFontOptions();
      }).observe(datalist, { childList: true, subtree: true });
    }

    function installCustomColorPicker() {
      const trigger = document.getElementById("color-picker-trigger");
      const swatch = document.getElementById("color-picker-swatch");
      const displayedValue = document.getElementById("color-picker-hex-value");
      const popover = document.getElementById("color-picker-popover");
      const plane = document.getElementById("color-picker-plane");
      const handle = document.getElementById("color-picker-handle");
      const hueInput = document.getElementById("color-picker-hue");
      const hexInput = document.getElementById("color-picker-hex");
      const copyButton = document.getElementById("color-picker-copy");
      const picker = trigger?.closest(".custom-color-picker");
      const inputValueDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value");
      const inputDisabledDescriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "disabled");
      if (!trigger || !swatch || !displayedValue || !popover || !plane || !handle || !hueInput || !hexInput || !copyButton || !picker || !inputValueDescriptor?.get || !inputValueDescriptor.set || !inputDisabledDescriptor?.get || !inputDisabledDescriptor.set) {
        throw new Error("Pemilih warna khusus tidak tersedia.");
      }

      let hsv = { hue: 0, saturation: 0, value: 1 };
      let draggingPlane = false;
      let applyingPickerColor = false;

      function rgbToHsv(hex) {
        const value = hex.replace("#", "");
        const red = parseInt(value.slice(0, 2), 16) / 255;
        const green = parseInt(value.slice(2, 4), 16) / 255;
        const blue = parseInt(value.slice(4, 6), 16) / 255;
        const max = Math.max(red, green, blue);
        const min = Math.min(red, green, blue);
        const delta = max - min;
        let hue = 0;
        if (delta) {
          if (max === red) hue = 60 * (((green - blue) / delta) % 6);
          else if (max === green) hue = 60 * ((blue - red) / delta + 2);
          else hue = 60 * ((red - green) / delta + 4);
        }
        if (hue < 0) hue += 360;
        return { hue, saturation: max === 0 ? 0 : delta / max, value: max };
      }

      function hsvToHex({ hue, saturation, value }) {
        const chroma = value * saturation;
        const section = hue / 60;
        const second = chroma * (1 - Math.abs(section % 2 - 1));
        const [red, green, blue] = section < 1 ? [chroma, second, 0]
          : section < 2 ? [second, chroma, 0]
          : section < 3 ? [0, chroma, second]
          : section < 4 ? [0, second, chroma]
          : section < 5 ? [second, 0, chroma]
          : [chroma, 0, second];
        const offset = value - chroma;
        return `#${[red, green, blue].map((channel) => Math.round((channel + offset) * 255).toString(16).padStart(2, "0")).join("")}`;
      }

      function normalizeHex(value, allowShort = false) {
        const hex = value.trim().replace(/^#/, "");
        if (allowShort && /^[\da-f]{3}$/i.test(hex)) {
          return `#${Array.from(hex, (digit) => `${digit}${digit}`).join("")}`;
        }
        return /^[\da-f]{6}$/i.test(hex) ? `#${hex}` : null;
      }

      function syncColorUi({ preserveHsv = false } = {}) {
        const hex = inputValueDescriptor.get.call(textColor).toUpperCase();
        const color = rgbToHsv(hex);
        if (!preserveHsv) {
          hsv = color.saturation === 0
            ? { ...hsv, value: color.value }
            : color;
        }
        trigger.disabled = inputDisabledDescriptor.get.call(textColor);
        trigger.setAttribute("aria-disabled", String(trigger.disabled));
        swatch.style.backgroundColor = hex;
        displayedValue.textContent = hex;
        hexInput.value = hex;
        hueInput.value = String(Math.round(hsv.hue));
        plane.style.setProperty("--picker-hue", `${hsv.hue}deg`);
        const planeBounds = plane.getBoundingClientRect();
        if (planeBounds.width > 14 && planeBounds.height > 14) {
          handle.style.left = `${7 + hsv.saturation * (planeBounds.width - 16)}px`;
          handle.style.top = `${7 + (1 - hsv.value) * (planeBounds.height - 16)}px`;
        } else {
          handle.style.left = `${hsv.saturation * 100}%`;
          handle.style.top = `${(1 - hsv.value) * 100}%`;
        }
        plane.setAttribute("aria-valuenow", String(Math.round(hsv.saturation * 100)));
        plane.setAttribute("aria-valuetext", `Saturasi ${Math.round(hsv.saturation * 100)}%, kecerahan ${Math.round(hsv.value * 100)}%`);
        picker.querySelectorAll("[data-color]").forEach((button) => {
          button.classList.toggle("is-active", button.dataset.color.toUpperCase() === hex);
        });
      }

      function applyColor({ dispatch = true } = {}) {
        const hex = hsvToHex(hsv);
        applyingPickerColor = true;
        try {
          inputValueDescriptor.set.call(textColor, hex);
          syncColorUi({ preserveHsv: true });
          if (dispatch) textColor.dispatchEvent(new Event("input", { bubbles: true }));
        } finally {
          applyingPickerColor = false;
        }
      }

      function updatePlaneFromPointer(event) {
        const bounds = plane.getBoundingClientRect();
        hsv.saturation = Math.max(0, Math.min(1, (event.clientX - bounds.left - 8) / Math.max(1, bounds.width - 16)));
        hsv.value = 1 - Math.max(0, Math.min(1, (event.clientY - bounds.top - 8) / Math.max(1, bounds.height - 16)));
        applyColor();
      }

      function closePicker() {
        popover.hidden = true;
        trigger.setAttribute("aria-expanded", "false");
      }

      Object.defineProperty(textColor, "value", {
        configurable: true,
        get() { return inputValueDescriptor.get.call(this); },
        set(value) {
          inputValueDescriptor.set.call(this, value);
          syncColorUi({ preserveHsv: applyingPickerColor });
        }
      });
      Object.defineProperty(textColor, "disabled", {
        configurable: true,
        get() { return inputDisabledDescriptor.get.call(this); },
        set(value) {
          inputDisabledDescriptor.set.call(this, value);
          syncColorUi();
        }
      });
      textColor.classList.add("color-picker-native");
      textColor.tabIndex = -1;
      textColor.setAttribute("aria-hidden", "true");
      trigger.addEventListener("click", () => {
        if (trigger.disabled) return;
        popover.hidden = !popover.hidden;
        trigger.setAttribute("aria-expanded", String(!popover.hidden));
        if (!popover.hidden) syncColorUi();
      });
      hueInput.addEventListener("input", () => {
        hsv.hue = Number(hueInput.value);
        applyColor();
      });
      plane.addEventListener("pointerdown", (event) => {
        draggingPlane = true;
        plane.setPointerCapture(event.pointerId);
        updatePlaneFromPointer(event);
      });
      plane.addEventListener("pointermove", (event) => {
        if (draggingPlane) updatePlaneFromPointer(event);
      });
      plane.addEventListener("pointerup", () => { draggingPlane = false; });
      plane.addEventListener("pointercancel", () => { draggingPlane = false; });
      plane.addEventListener("keydown", (event) => {
        const step = event.shiftKey ? 0.1 : 0.02;
        if (event.key === "ArrowLeft") hsv.saturation = Math.max(0, hsv.saturation - step);
        else if (event.key === "ArrowRight") hsv.saturation = Math.min(1, hsv.saturation + step);
        else if (event.key === "ArrowUp") hsv.value = Math.min(1, hsv.value + step);
        else if (event.key === "ArrowDown") hsv.value = Math.max(0, hsv.value - step);
        else return;
        event.preventDefault();
        applyColor();
      });
      function updateHexColor(allowShort = false) {
        const normalizedHex = normalizeHex(hexInput.value, allowShort);
        const valid = normalizedHex !== null;
        hexInput.setAttribute("aria-invalid", String(!valid));
        hexInput.classList.toggle("is-invalid", !valid);
        if (!valid) return;
        hsv = rgbToHsv(normalizedHex);
        applyColor();
      }
      hexInput.addEventListener("input", () => updateHexColor());
      hexInput.addEventListener("change", () => updateHexColor(true));
      picker.querySelectorAll("[data-color]").forEach((button) => {
        button.style.setProperty("--swatch-color", button.dataset.color);
        button.addEventListener("click", () => {
          hsv = rgbToHsv(button.dataset.color);
          applyColor();
        });
      });
      copyButton.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(inputValueDescriptor.get.call(textColor));
          setStatus("Kode warna berhasil disalin.", "success");
        } catch (error) {
          setStatus(`Kode warna tidak dapat disalin: ${error.message}`, "error");
        }
      });
      textColor.addEventListener("input", () => syncColorUi({ preserveHsv: applyingPickerColor }));
      textColor.addEventListener("change", syncColorUi);
      document.addEventListener("pointerdown", (event) => {
        if (!picker.contains(event.target)) closePicker();
      });
      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !popover.hidden) {
          closePicker();
          trigger.focus();
        }
      });
      syncColorUi();
    }

    installCustomSelects();
    installCustomFontPicker();
    installCustomColorPicker();

    updatePositionControls();
    updatePlacementControls();
    updateContentControls();
    updateSequencePreview();
    updateSizeDescription();
    refreshPreview();

    generateButton.addEventListener("click", async () => {
      let entries;
      try {
        validateDesignSettings();
        entries = getSelectedValues();
      } catch (error) {
        setStatus(`Pengaturan ukuran tidak valid: ${error.message}`, "error");
        return;
      }
      if (!entries.length) {
        setStatus("Kolom yang dipilih tidak berisi data yang bisa dicetak.", "error");
        return;
      }

      generateButton.disabled = true;
      const zip = new JSZip();
      const usedNames = new Map();
      try {
        for (let index = 0; index < entries.length; index += 1) {
          const values = entries[index];
          const baseValue = values.find((value) => value.length > 0) || `baris-${index + 1}`;
          const baseName = `hasil_${safeFilePart(baseValue)}`;
          const occurrence = (usedNames.get(baseName) || 0) + 1;
          usedNames.set(baseName, occurrence);
          const fileName = occurrence === 1 ? `${baseName}.jpg` : `${baseName}_${occurrence}.jpg`;
          const jpeg = await makeTicket(values);
          zip.file(fileName, jpeg);
          setStatus(`Membuat JPEG ${index + 1} dari ${entries.length}...`);
          if (index % 10 === 9) await new Promise((resolve) => setTimeout(resolve, 0));
        }

        setStatus(`Mengemas ${entries.length} JPEG ke ZIP...`);
        const archive = await zip.generateAsync(
          { type: "blob", compression: "STORE" },
          (progress) => setStatus(`Mengemas ZIP... ${Math.round(progress.percent)}%`)
        );
        const url = URL.createObjectURL(archive);
        const link = document.createElement("a");
        link.href = url;
        link.download = "hasil-template.zip";
        document.body.append(link);
        link.click();
        link.remove();
        window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
        setStatus(`${entries.length} JPEG berhasil dibuat. Unduhan hasil-template.zip dimulai.`, "success");
      } catch (error) {
        setStatus(`Proses gagal: ${error.message}`, "error");
      } finally {
        updateButton();
      }
    });
})();
