/**
 * Transform certificate data to snake_case format for API responses
 */
exports.item = (data) => {
    if (!data) return null;

    return {
        id: data.id,
        certificate_id: data.certificateId || data.certificate_id,
        user_id: data.userId || data.user_id,
        exam_id: data.examId || data.exam_id,
        certificate_type: data.certificateType || data.certificate_type,
        certificate_number: data.certificateNumber || data.certificate_number,
        issued_date: data.issuedDate || data.issued_date,
        test_date: data.testDate || data.test_date,
        valid_until: data.validUntil || data.valid_until,
        listening_score: data.listeningScore !== undefined ? data.listeningScore : data.listening_score,
        structure_score: data.structureScore !== undefined ? data.structureScore : data.structure_score,
        reading_score: data.readingScore !== undefined ? data.readingScore : data.reading_score,
        overall_score: data.overallScore !== undefined ? data.overallScore : data.overall_score,
        director_name: data.directorName || data.director_name,
        certificate_url: data.certificateUrl || data.certificate_url,
        description: data.description,
        created_at: data.created_at || data.createdAt,
        updated_at: data.updated_at || data.updatedAt,
        deleted_at: data.deleted_at || data.deletedAt,
        // Include user data if present
        user: data.user ? {
            id: data.user.id,
            uuid: data.user.uuid,
            full_name: data.user.full_name || data.user.fullName,
            email: data.user.email,
            photo_url: data.user.photo_url || data.user.photoUrl,
            institution_name: data.user.institution_name || data.user.institutionName
        } : undefined,
        // Include exam data if present
        exam: data.exam ? {
            id: data.exam.id,
            uuid: data.exam.uuid,
            title: data.exam.title,
            category_id: data.exam.category_id || data.exam.categoryId,
            additional_information: data.exam.additional_information || data.exam.additionalInformation
        } : undefined
    };
};

/**
 * Transform an array of certificates
 */
exports.collection = (data) => {
    if (!Array.isArray(data)) return [];
    return data.map(exports.item);
};
