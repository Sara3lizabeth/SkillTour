import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

export const aiService = {
  async generateLessonContent(courseTitle: string, lessonTitle: string): Promise<string> {
    const prompt = `Actúa como un instructor experto para el curso "${courseTitle}". Genera el contenido detallado de la lección titulada "${lessonTitle}". 
    El contenido debe ser educativo, práctico y estructurado en HTML limpio (sin etiquetas de html, head o body, solo etiquetas de contenido como h1, h2, p, ul, li, strong, code).
    Incluye explicaciones claras, pasos a seguir y ejemplos prácticos.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "<p>No se pudo generar el contenido.</p>";
    } catch (error) {
      console.error("AI Generation Error:", error);
      return "<p>Error al conectar con la IA.</p>";
    }
  },

  async generateFactoryLesson(courseTitle: string, lessonTitle: string): Promise<string> {
    const prompt = `Actúa como un INSTRUCTOR TÉCNICO EXPERTO. 
Genera el contenido técnico REAL para la lección "${lessonTitle}" del curso "${courseTitle}".

REGLAS CRÍTICAS:
1. MÍNIMO 300 PALABRAS de contenido técnico puro.
2. PROHIBIDO escribir introducciones, saludos o conclusiones.
3. NO REPETIR contenido ni ejemplos de otras lecciones.
4. FORMATO: Únicamente HTML (h4, p, ul, li, strong).
5. NO USAR MARKDOWN. No digas "He generado el contenido".
6. Todo el contenido debe ser práctico, orientado al trabajo real en el campo.

ESTRUCTURA OBLIGATORIA:
<h4>${lessonTitle}</h4>
<p>[Explicación técnica clara, detallada y profunda del proceso]</p>
<ul>
  <li>[Paso de ejecución técnica 1 con descripción]</li>
  <li>[Paso de ejecución técnica 2 con descripción]</li>
  <li>[Paso de ejecución técnica 3 con descripción]</li>
  <li>[Paso de ejecución técnica 4 con descripción]</li>
</ul>
<p><strong>En el campo:</strong> [Caso de uso real o escenario de resolución de problemas en el puesto de trabajo]</p>`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text || "<p>Error en la generación de datos técnicos.</p>";
    } catch (error) {
      console.error("Critical AI Engine Error:", error);
      return `<p>Falla en el núcleo de datos: ${error}</p>`;
    }
  },

  async generateExamQuestions(courseTitle: string): Promise<any[]> {
    const prompt = `Genera un examen técnico de 5 preguntas de opción múltiple para el curso "${courseTitle}". 
    Enfócate en habilidades prácticas reales.
    Retorna un array de objetos JSON con la siguiente estructura:
    [
      {
        "id": "q1",
        "text": "la pregunta",
        "options": ["opción A", "opción B", "opción C", "opción D"],
        "correctAnswer": 0
      },
      ...
    ]`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctAnswer: { type: Type.NUMBER }
              },
              required: ["id", "text", "options", "correctAnswer"]
            }
          }
        }
      });
      return JSON.parse(response.text || "[]");
    } catch (error) {
      console.error("AI Exam Generation Error:", error);
      return [];
    }
  }
};
