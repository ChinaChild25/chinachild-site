import Image from "next/image";
import { buttonStyles } from "@/components/ui/button";
import Reveal from "@/components/ui/Reveal";
import certificatesImage from "@/public/license/Certificates.webp";

export default function CertificateSection() {
  return (
    <section id="sertifikat" className="section-space">
      <div className="page-shell-wide">
        <Reveal>
          <div className="card-cream overflow-visible rounded-[24px] px-6 py-8 sm:rounded-[28px] sm:px-10 sm:py-12 lg:px-16 lg:py-14">
            <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
              <div className="max-w-xl">
                <h2 className="section-title">
                  Выдаем сертификат о прохождении обучения
                </h2>
                <p className="section-description !mx-0">
                  После завершения программы вы получите именной сертификат
                  ChinaChild. В нём будут указаны пройденный курс, объём обучения
                  и период занятий — сертификат можно сохранить или распечатать.
                </p>
                <div className="mt-8">
                  <a
                    href="https://my.chinachild.ru/certificate/bQCtCJCkwTHsUWb2i13Jq16_oM_TlCMONvRBceqODsQ"
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={buttonStyles({
                      size: "large",
                      className: "w-full justify-center sm:w-auto",
                    })}
                  >
                    Открыть пример
                  </a>
                </div>
              </div>

              <div>
                <Image
                  src={certificatesImage}
                  alt="Примеры именных сертификатов ChinaChild о прохождении курса китайского языка"
                  sizes="(min-width: 1024px) 640px, (min-width: 768px) 680px, 100vw"
                  className="h-auto w-full"
                />
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
