namespace Store.API.Models.DTOs
{
    public class ProjectFileResponse
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string FileType { get; set; } = null!;
        public string FilePath { get; set; } = null!;
        public string? OriginalFileName { get; set; }
        public long FileSize { get; set; }
        public DateTime UploadedAt { get; set; }
    }

    public class UploadProjectFileRequest
    {
        public int ProjectId { get; set; }
        public string FileType { get; set; } = "source_code"; // source_code, documentation
    }
}