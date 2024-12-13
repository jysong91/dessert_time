import { Injectable } from '@nestjs/common';
import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

@Injectable()
export class AppService {
  private client: DocumentProcessorServiceClient;
  private name: string;

  constructor() {
    const projectId = 'clear-practice-444613-v6';
    const location = 'us';
    const processorId = '885417398df8a4f6'; // receipt-extractor
    // const processorId = '475cbf2a154f6d87'; //ReceiptProc

    this.name = `projects/${projectId}/locations/${location}/processors/${processorId}`;

    // 다운로드한 서비스 계정 키 파일의 절대 또는 상대 경로를 입력
    this.client = new DocumentProcessorServiceClient({
      keyFilename: './clear-practice-444613-v6-194f82a91207.json',
    });
  }

  async processDocument(fileBuffer: Buffer, mimeType = 'application/pdf'): Promise<{ text: string; entities: any[]; formFields: any[] }> {
    const encodedImage = fileBuffer.toString('base64');

    const request = {
      name: this.name,
      rawDocument: {
        content: encodedImage,
        mimeType: mimeType,
      },
    };

    const [result] = await this.client.processDocument(request);
    // const { document } = result;
    // return document && document.text ? document.text : '';
    const { document } = result;

    // 전체 텍스트
    const fullText = document?.text;

    // 엔티티 정보 (커스텀 필드)
    const entities = document?.entities;

    // 페이지 별 폼 필드 (Form Parser를 사용한 경우)
    const formFields = document?.pages?.flatMap(page => page.formFields || []);

    console.log('Full Text:', fullText);
    console.log('Entities:', entities);
    console.log('Form Fields:', formFields);

    // 필요하다면 구조화된 필드나 entities를 가공해서 원하는 형태로 반환
    return { text: fullText, entities, formFields };
  }
}