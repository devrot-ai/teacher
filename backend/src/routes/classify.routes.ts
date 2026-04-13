import express, { Request, Response } from "express";
import { documentClassifierService } from "../services/documentClassifier.service";
import { documentService } from "../services/document.service";

const router = express.Router();

/**
 * POST /api/classify
 * Classify a document by its fileId
 * Body: { fileId: string }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { fileId, text } = req.body;

    let contentToClassify = text || "";

    // If fileId provided, get document content
    if (fileId && !contentToClassify) {
      try {
        const pages = await documentService.getAllPages(fileId);
        if (pages && pages.length > 0) {
          contentToClassify = pages
            .sort((a: any, b: any) => a.pageNumber - b.pageNumber)
            .map((p: any) => p.content)
            .join("\n\n");
        } else {
          const doc = await documentService.getDocument(fileId);
          if (doc) {
            contentToClassify = doc;
          }
        }
      } catch (e) {
        // Document not found in DB — continue with empty text
      }
    }

    if (!contentToClassify || contentToClassify.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "No content to classify. Provide a fileId or text.",
      });
    }

    const result = documentClassifierService.classify(contentToClassify);

    res.json({
      success: true,
      classification: result,
    });
  } catch (error: any) {
    console.error("Classification error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Classification failed",
    });
  }
});

/**
 * POST /api/classify/text
 * Classify raw text directly (no fileId needed)
 * Body: { text: string }
 */
router.post("/text", async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "text is required",
      });
    }

    const result = documentClassifierService.classify(text);

    res.json({
      success: true,
      classification: result,
    });
  } catch (error: any) {
    console.error("Classification error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Classification failed",
    });
  }
});

export default router;
