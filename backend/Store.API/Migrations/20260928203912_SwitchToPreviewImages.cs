using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Store.API.Migrations
{
    /// <inheritdoc />
    public partial class SwitchToPreviewImages : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_projects_project_files_PreviewFileId",
                table: "projects");

            migrationBuilder.DropIndex(
                name: "IX_projects_PreviewFileId",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PreviewEndLine",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PreviewFileId",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PreviewSelection",
                table: "projects");

            migrationBuilder.DropColumn(
                name: "PreviewStartLine",
                table: "projects");

            migrationBuilder.AddColumn<string>(
                name: "PreviewImages",
                table: "projects",
                type: "jsonb",
                nullable: false,
                defaultValue: "[]");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PreviewImages",
                table: "projects");

            migrationBuilder.AddColumn<int>(
                name: "PreviewEndLine",
                table: "projects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PreviewFileId",
                table: "projects",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreviewSelection",
                table: "projects",
                type: "jsonb",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PreviewStartLine",
                table: "projects",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_projects_PreviewFileId",
                table: "projects",
                column: "PreviewFileId");

            migrationBuilder.AddForeignKey(
                name: "FK_projects_project_files_PreviewFileId",
                table: "projects",
                column: "PreviewFileId",
                principalTable: "project_files",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
