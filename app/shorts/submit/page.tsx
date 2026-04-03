"use client";

import { CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@heroui/button";
import { Constants } from "@/constants";
import { empty_community } from "@/constants/templates";
import MainWrapper from "@/components/wrappers/MainWrapper";
import PublishButton from "@/components/submit/PublishButton";
import { useShortsSubmit } from "@/hooks/shorts/useShortsSubmit";
import {
  StageStatusIcon,
  StepUpload,
} from "@/components/shorts/submit/StepUpload";
import { StepDetails } from "@/components/shorts/submit/StepDetails";
import { StepThumbnail } from "@/components/shorts/submit/StepThumbnail";
import { StepPublish } from "@/components/shorts/submit/StepPublish";

export default function ShortsSubmitPage() {
  const {
    file,
    compressedFile,
    sizeInfo,
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    tagInput,
    setTagInput,
    videoCid,
    thumbnailUrl,
    isProcessingThumbnail,
    showThumbnail,
    setShowThumbnail,
    processState,
    isPublishing,
    uploadProgress,
    imageUploadProgress,
    activeStep,
    setActiveStep,
    compressionMode,
    processAndUpload,
    videoRef,
    videoObjectUrl,
    thumbObjectUrl,
    canEditDetails,
    canManageThumbnail,
    canPublish,
    canOpenStep,
    latestStage,
    recentStageLog,
    stageCards,
    flowSteps,
    handleFileChange,
    handleUploadAndSign,
    handleThumbnailUpload,
    handleCaptureFrame,
    handleCancelAndClose,
    getBodyText,
    handlePublished,
    handlePublishPending,
  } = useShortsSubmit();

  return (
    <MainWrapper className="flex flex-col gap-4 p-2 sm:p-6">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="relative z-10 flex w-full flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-primary shadow-sm">
              <Sparkles size={14} className="animate-pulse" />
              <span>Shorts Studio</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-success/80">
                Connection Active
              </span>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-black tracking-tighter sm:text-3xl text-foreground leading-none">
                Create your{" "}
                <span className="bg-linear-to-r from-primary to-danger bg-clip-text text-transparent">
                  Short
                </span>
              </h1>
              <p className="max-w-md text-xs font-medium text-default-500 leading-normal">
                Convert your vertical clips into high-quality digital content,
                optimized for instant playback.
              </p>
            </div>

            {latestStage && (
              <div className="hidden min-w-[200px] rounded-3xl border border-primary/10 bg-linear-to-br from-default-100 to-default-50 p-3 shadow-sm dark:from-default-100/10 dark:to-transparent sm:block">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-default-500">
                    Current Task
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-background p-2 shadow-inner">
                    <StageStatusIcon status={latestStage.status} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-default-800">
                      {latestStage.label}
                    </p>
                    {latestStage.detail && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] font-medium text-default-500/80">
                        {latestStage.detail}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-4">
        {/* Immersive Stepper */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2">
          {flowSteps.map((item, index) => {
            const isSelectable = canOpenStep(index + 1);
            return (
              <div
                key={item.step}
                className="flex flex-1 items-center gap-4 min-w-[140px]"
              >
                <button
                  type="button"
                  onClick={() =>
                    isSelectable && setActiveStep((index + 1) as 1 | 2 | 3 | 4)
                  }
                  disabled={!isSelectable}
                  className={`group relative flex flex-1 items-center gap-3 rounded-2xl border p-3 transition-all duration-300 ${
                    item.complete
                      ? "border-success/30 bg-success/10"
                      : item.active
                        ? "border-primary/40 bg-linear-to-br from-primary/10 to-transparent shadow-lg shadow-primary/5"
                        : "border-default-200 bg-white/5 dark:border-white/5"
                  } ${isSelectable ? "cursor-pointer hover:scale-[1.02] hover:border-primary/50" : "cursor-not-allowed opacity-40 grayscale"}`}
                >
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black transition-colors ${
                      item.complete
                        ? "bg-success text-white"
                        : item.active
                          ? "bg-primary text-white"
                          : "bg-default-200 text-default-500"
                    }`}
                  >
                    {item.complete ? <CheckCircle2 size={16} /> : index + 1}
                  </div>
                  <div className="min-w-0 text-left">
                    <p
                      className={`truncate text-xs font-black uppercase tracking-widest ${item.active ? "text-primary" : "text-default-500"}`}
                    >
                      Step {item.step}
                    </p>
                    <p className="truncate text-sm font-bold text-foreground">
                      {item.title}
                    </p>
                  </div>
                </button>
                {index < flowSteps.length - 1 && (
                  <div className="hidden h-px w-8 bg-default-200 lg:block shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Mobile live status */}
        {latestStage && (
          <div className="rounded-2xl border border-default-200/70 bg-default-100 px-3 py-2 dark:border-default-100/10 sm:hidden">
            <div className="flex items-start gap-2">
              <StageStatusIcon status={latestStage.status} />
              <div className="min-w-0">
                <p className="text-[10px] font-black uppercase tracking-[0.24em] text-default-500">
                  Current Action
                </p>
                <p className="truncate text-xs font-semibold text-default-700">
                  {latestStage.label}
                </p>
                {latestStage.detail && (
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-default-700">
                    {latestStage.detail}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Active Step Container */}
        <div className="mt-2 rounded-4xl border border-default-200/60 bg-white shadow-2xl dark:border-white/5 dark:bg-zinc-950/50 overflow-hidden min-h-[350px]">
          <div className="h-1 w-full bg-default-100 dark:bg-white/5">
            <div
              className="h-full bg-linear-to-r from-primary to-danger transition-all duration-500 ease-out"
              style={{ width: `${(activeStep / 4) * 100}%` }}
            />
          </div>
          <div className="p-8 sm:p-10">
            {activeStep === 1 && (
              <StepUpload
                file={file}
                processState={processState}
                stageCards={stageCards}
                recentStageLog={recentStageLog}
                uploadProgress={uploadProgress}
                sizeInfo={sizeInfo}
                onFileChange={handleFileChange}
                onUploadAndSign={handleUploadAndSign}
                onRecompress={() => file && processAndUpload(file, "high")}
                onNext={() => setActiveStep(2)}
                videoCid={videoCid}
                compressionMode={compressionMode}
              />
            )}
            {activeStep === 2 && (
              <StepDetails
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                tags={tags}
                setTags={setTags}
                tagInput={tagInput}
                setTagInput={setTagInput}
                canEditDetails={canEditDetails}
                canOpenStep3={canOpenStep(3)}
                onNext={() => setActiveStep(3)}
              />
            )}
            {activeStep === 3 && (
              <StepThumbnail
                videoObjectUrl={videoObjectUrl}
                thumbObjectUrl={thumbObjectUrl}
                thumbnailUrl={thumbnailUrl}
                showThumbnail={showThumbnail}
                setShowThumbnail={setShowThumbnail}
                videoRef={videoRef as React.RefObject<HTMLVideoElement>}
                thumbnailStageCard={stageCards[2]}
                isProcessingThumbnail={isProcessingThumbnail}
                imageUploadProgress={imageUploadProgress}
                canManageThumbnail={canManageThumbnail}
                onCaptureFrame={handleCaptureFrame}
                onThumbnailUpload={handleThumbnailUpload}
                onNext={() => setActiveStep(4)}
              />
            )}
            {activeStep === 4 && (
              <StepPublish
                title={title}
                thumbnailUrl={thumbnailUrl}
                videoCid={videoCid}
                tags={tags}
                processState={processState}
                canPublish={canPublish}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2">
        <Button
          color="danger"
          variant="light"
          onPress={handleCancelAndClose}
          isDisabled={processState === "uploading_video" || isPublishing}
        >
          Cancel
        </Button>
        <PublishButton
          title={title}
          body={getBodyText()}
          tags={tags}
          requiredTags={["shorts", "steemshorts"]}
          isShort={true}
          extraMetadata={{
            video: videoCid,
            image: thumbnailUrl ? [thumbnailUrl] : [],
            isHls: true,
          }}
          beneficiaries={[
            { account: Constants.official_account, weight: 1000 },
          ]}
          community={empty_community(Constants.official_community, "SteemPro")}
          payoutType={Constants.reward_types[1]}
          onPublished={handlePublished}
          onPending={handlePublishPending}
          isDisabled={!canPublish}
          buttonTitle="Publish"
          color="primary"
          variant="solid"
          className="font-semibold shadow-md shadow-primary/20"
        />
      </div>
    </MainWrapper>
  );
}
